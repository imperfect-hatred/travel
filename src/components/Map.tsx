'use client'

import { useEffect, useRef } from 'react'
// Импортируем CSS Leaflet напрямую для корректной работы путей к иконкам
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface MapProps {
  lat: number
  lng: number
  name?: string
  zoom?: number
}

// Устанавливаем пути к иконкам Leaflet по умолчанию, чтобы избежать ошибок 404
// Используем файлы из public/leaflet/dist/images
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/dist/images/marker-icon-2x.png',
  iconUrl: '/leaflet/dist/images/marker-icon.png',
  shadowUrl: '/leaflet/dist/images/marker-shadow.png',
});

export function Map({ lat, lng, name, zoom = 10 }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Мы больше не загружаем скрипты динамически, так как они импортированы
    const initializeOrUpdateMap = () => {
      if (!mapRef.current) return

      if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], zoom)
        leafletMapRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            leafletMapRef.current.removeLayer(layer)
          }
        })
        L.marker([lat, lng]).addTo(leafletMapRef.current).bindPopup(name || 'Местоположение').openPopup()
      } else {
        const map = L.map(mapRef.current).setView([lat, lng], zoom)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)
        L.marker([lat, lng]).addTo(map).bindPopup(name || 'Местоположение').openPopup()
        leafletMapRef.current = map
      }
    }

    initializeOrUpdateMap()

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [lat, lng, name, zoom])

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-lg border border-gray-200"
      style={{ minHeight: '400px' }}
    />
  )
}




