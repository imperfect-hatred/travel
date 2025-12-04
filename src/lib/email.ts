export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Отправляет email через EmailJS API (серверная отправка)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Получаем настройки EmailJS из переменных окружения
    // В Next.js переменные из .env.local доступны в server-side коде
    const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY?.trim()
    const emailjsServiceId = process.env.EMAILJS_SERVICE_ID?.trim()
    const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID?.trim()

    // Детальная диагностика
    console.log('🔍 Диагностика EmailJS:', {
      hasPublicKey: !!emailjsPublicKey,
      hasServiceId: !!emailjsServiceId,
      hasTemplateId: !!emailjsTemplateId,
      publicKeyLength: emailjsPublicKey?.length || 0,
      serviceIdPrefix: emailjsServiceId?.substring(0, 10) || 'не установлен',
      templateIdPrefix: emailjsTemplateId?.substring(0, 10) || 'не установлен',
    })

    // Если EmailJS не настроен, логируем email
    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      console.log('📧 Email отправка (EmailJS не настроен, только логирование):', {
        to: options.to,
        subject: options.subject,
        html: options.html.substring(0, 200) + (options.html.length > 200 ? '...' : ''),
      })
      console.log('💡 Для реальной отправки email настройте EmailJS в .env.local:')
      console.log('   EMAILJS_PUBLIC_KEY:', emailjsPublicKey ? `✓ установлен (${emailjsPublicKey.length} символов)` : '✗ не установлен')
      console.log('   EMAILJS_SERVICE_ID:', emailjsServiceId ? `✓ установлен (${emailjsServiceId.length} символов)` : '✗ не установлен')
      console.log('   EMAILJS_TEMPLATE_ID:', emailjsTemplateId ? `✓ установлен (${emailjsTemplateId.length} символов)` : '✗ не установлен')
      console.log('   ⚠️  ВАЖНО: После изменения .env.local обязательно перезапустите сервер!')
      console.log('   См. README.md для инструкций по настройке')
      
      // В разработке возвращаем успех, чтобы не блокировать процесс
      if (process.env.NODE_ENV === 'development') {
        return true
      } else {
        console.error('❌ EmailJS не настроен. Email не отправлен.')
        return false
      }
    }

    // Отправляем email через EmailJS REST API
    // EmailJS требует отправку данных как form-urlencoded
    const templateParams = {
      to_email: options.to,
      subject: options.subject,
      message_html: options.html,
      message_text: options.text || options.html.replace(/<[^>]*>/g, ''),
    }

    // Проверяем, что все ключи не пустые
    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      console.error('❌ EmailJS ключи не установлены или пустые')
      return false
    }

    // Проверяем формат ключей (предупреждение)
    if (emailjsPublicKey.length < 10) {
      console.warn('⚠️  EMAILJS_PUBLIC_KEY кажется слишком коротким. Обычно это длинная строка.')
    }
    if (!emailjsServiceId.startsWith('service_')) {
      console.warn('⚠️  EMAILJS_SERVICE_ID должен начинаться с "service_"')
    }
    if (!emailjsTemplateId.startsWith('template_')) {
      console.warn('⚠️  EMAILJS_TEMPLATE_ID должен начинаться с "template_"')
    }

    const formData = new URLSearchParams()
    formData.append('service_id', emailjsServiceId)
    formData.append('template_id', emailjsTemplateId)
    formData.append('user_id', emailjsPublicKey)
    formData.append('template_params', JSON.stringify(templateParams))

    // Логируем для отладки (без чувствительных данных)
    console.log('📤 Отправка email через EmailJS:', {
      service_id: emailjsServiceId.substring(0, 12) + '...',
      template_id: emailjsTemplateId.substring(0, 12) + '...',
      user_id: emailjsPublicKey.substring(0, 12) + '...',
      to: options.to,
      template_params_keys: Object.keys(templateParams),
    })

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const responseText = await response.text()
      
      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { text: responseText || 'Unknown error' }
        }
        
        console.error('❌ Ошибка EmailJS API:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        
        // Детальные сообщения об ошибках
        if (response.status === 403) {
          console.error('💡 Ошибка 403: Проверьте правильность ключей EmailJS:')
          console.error('   - EMAILJS_PUBLIC_KEY (User ID) должен быть из Account → General')
          console.error('   - EMAILJS_SERVICE_ID должен быть из Email Services')
          console.error('   - EMAILJS_TEMPLATE_ID должен быть из Email Templates')
          console.error('   - Убедитесь, что шаблон использует переменные: {{to_email}}, {{subject}}, {{message_html}}')
        } else if (response.status === 400) {
          console.error('💡 Ошибка 400: Проверьте:')
          if (errorData.text?.includes('Public Key')) {
            console.error('   - EMAILJS_PUBLIC_KEY не установлен или неверный')
            console.error('   - Проверьте файл .env.local и перезапустите сервер')
          } else if (errorData.text?.includes('Service')) {
            console.error('   - EMAILJS_SERVICE_ID не установлен или неверный')
          } else if (errorData.text?.includes('Template')) {
            console.error('   - EMAILJS_TEMPLATE_ID не установлен или неверный')
          } else {
            console.error('   - Формат данных в шаблоне EmailJS')
            console.error('   - Убедитесь, что шаблон использует переменные: {{to_email}}, {{subject}}, {{message_html}}')
          }
        }
        
        return false
      }

      // Успешный ответ
      let result
      try {
        result = JSON.parse(responseText)
      } catch {
        result = { text: responseText || 'Email sent' }
      }
      
      console.log(`✅ Email успешно отправлен на: ${options.to}`)
      return true
    } catch (fetchError: any) {
      console.error('❌ Ошибка сети при отправке email через EmailJS:', fetchError.message)
      return false
    }
  } catch (error: any) {
    console.error('❌ Ошибка при отправке email через EmailJS:', error)
    return false
  }
}

/**
 * Отправляет email для сброса пароля
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Сброс пароля - TravelGuide</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 32px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 8px 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 24px;
          }
          .message {
            color: #475569;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: background-color 0.2s;
            margin: 24px 0;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .link-text {
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            color: #64748b;
            border-left: 4px solid #3b82f6;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          .warning h3 {
            color: #92400e;
            margin-top: 0;
            font-size: 16px;
          }
          .warning p {
            margin-bottom: 0;
            color: #92400e;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #3b82f6;
            margin-bottom: 8px;
          }
          @media (max-width: 600px) {
            .container {
              border-radius: 0;
              box-shadow: none;
            }
            .header, .content {
              padding: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TravelGuide</h1>
            <p>Ваш гид в мире путешествий</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Здравствуйте${userName ? `, ${userName}` : ''}!
            </div>
            
            <div class="message">
              <p>Вы запросили сброс пароля для вашего аккаунта в TravelGuide.</p>
              <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Сбросить пароль</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Или скопируйте и вставьте эту ссылку в браузер:
            </p>
            
            <div class="link-text">
              ${resetUrl}
            </div>
            
            <div class="warning">
              <h3>⚠️ Важная информация</h3>
              <p>
                Эта ссылка действительна только в течение 1 часа.<br>
                Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              Если у вас возникли проблемы с кнопкой, скопируйте ссылку выше и вставьте в адресную строку браузера.
            </p>
          </div>
          
          <div class="footer">
            <div class="logo">TravelGuide</div>
            <p>© ${new Date().getFullYear()} TravelGuide. Все права защищены.</p>
            <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            <p>
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="color: #3b82f6; text-decoration: none;">
                Перейти на сайт
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Сброс пароля - TravelGuide

Здравствуйте${userName ? `, ${userName}` : ''}!

Вы запросили сброс пароля для вашего аккаунта в TravelGuide.

Для сброса пароля перейдите по ссылке:
${resetUrl}

Важно: Ссылка действительна только в течение 1 часа.

Если вы не запрашивали сброс пароля, проигнорируйте это письмо.

---
© ${new Date().getFullYear()} TravelGuide. Все права защищены.
${process.env.NEXTAUTH_URL || 'http://localhost:3000'}
  `

  return await sendEmail({
    to: email,
    subject: 'Сброс пароля - TravelGuide',
    html,
    text,
  })
}

/**
 * Отправляет email с подтверждением смены пароля
 */
export async function sendPasswordChangedEmail(
  email: string,
  userName?: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Пароль изменен - TravelGuide</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 32px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 24px;
          }
          .message {
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.7;
          }
          .success-box {
            background-color: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
          }
          .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 16px;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #3b82f6;
            margin-bottom: 8px;
          }
          @media (max-width: 600px) {
            .container {
              border-radius: 0;
              box-shadow: none;
            }
            .header, .content {
              padding: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Пароль изменен</h1>
            <p>TravelGuide - Ваш гид в мире путешествий</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Здравствуйте${userName ? `, ${userName}` : ''}!
            </div>
            
            <div class="message">
              <p>Пароль для вашего аккаунта в TravelGuide был успешно изменен.</p>
            </div>
            
            <div class="success-box">
              <div class="success-icon">✓</div>
              <h3 style="margin: 0; color: #065f46;">Пароль успешно обновлен</h3>
              <p style="margin: 8px 0 0; color: #047857;">
                Теперь вы можете использовать новый пароль для входа в систему.
              </p>
            </div>
            
            <div class="warning">
              <p><strong>Важно:</strong> Если вы не меняли пароль, немедленно свяжитесь с нашей поддержкой.</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" 
                 style="display: inline-block; background-color: #3b82f6; color: white; 
                        text-decoration: none; padding: 12px 24px; border-radius: 6px;
                        font-weight: 600; transition: background-color 0.2s;">
                Войти в аккаунт
              </a>
            </p>
          </div>
          
          <div class="footer">
            <div class="logo">TravelGuide</div>
            <p>© ${new Date().getFullYear()} TravelGuide. Все права защищены.</p>
            <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Пароль изменен - TravelGuide

Здравствуйте${userName ? `, ${userName}` : ''}!

Пароль для вашего аккаунта в TravelGuide был успешно изменен.

Важно: Если вы не меняли пароль, немедленно свяжитесь с нашей поддержкой.

Войти в аккаунт: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin

---
© ${new Date().getFullYear()} TravelGuide. Все права защищены.
  `

  return await sendEmail({
    to: email,
    subject: 'Пароль изменен - TravelGuide',
    html,
    text,
  })
}
