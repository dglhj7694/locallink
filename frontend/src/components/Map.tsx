'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapProps {
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  onChange?: (lat: number, lng: number, address: string) => void;
  readOnly?: boolean;
}

export default function Map({ latitude, longitude, locationName, onChange, readOnly = false }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    // Check if Kakao Maps script is loaded
    const checkKakaoMap = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        clearInterval(checkKakaoMap);
        window.kakao.maps.load(() => {
          setMapLoaded(true);
        });
      }
    }, 100);

    return () => clearInterval(checkKakaoMap);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const lat = latitude || 37.566826;
    const lng = longitude || 126.9786567;
    
    const mapOption = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3,
    };

    const map = new window.kakao.maps.Map(mapRef.current, mapOption);
    const marker = new window.kakao.maps.Marker({
      position: map.getCenter(),
      map: map,
    });

    if (!readOnly && onChange) {
      window.kakao.maps.event.addListener(map, 'click', function(mouseEvent: any) {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
        
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          let address = locationName || '선택한 위치';
          if (status === window.kakao.maps.services.Status.OK) {
            address = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
          }
          onChange(latlng.getLat(), latlng.getLng(), address);
        });
      });
    }

    // Attach map to ref for search use
    (mapRef.current as any).kakaoMap = map;
    (mapRef.current as any).kakaoMarker = marker;

  }, [mapLoaded, latitude, longitude, readOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim() || !mapLoaded || !mapRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const map = (mapRef.current as any).kakaoMap;
        const marker = (mapRef.current as any).kakaoMarker;
        
        if (map && marker) {
          const latlng = new window.kakao.maps.LatLng(data[0].y, data[0].x);
          map.setCenter(latlng);
          marker.setPosition(latlng);
          
          if (onChange) {
            onChange(Number(data[0].y), Number(data[0].x), data[0].place_name || data[0].road_address_name || data[0].address_name);
          }
        }
      } else {
        alert('검색 결과가 없습니다.');
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e as any);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {!readOnly && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="장소 검색 (예: 강남역, 올림픽공원)"
            className="glass-input"
            style={{ flex: 1 }}
          />
          <button type="button" onClick={handleSearch} className="btn-secondary" style={{ padding: '0 16px' }}>검색</button>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '300px', 
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'rgba(30, 41, 59, 0.5)'
        }} 
      />
      {locationName && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-surface-200)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📍</span> {locationName}
        </div>
      )}
    </div>
  );
}
