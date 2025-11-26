'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Download, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface SurveyPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface SurveyChartFormData {
  surveyName: string;
  propertyAddress: string;
  surveyorName: string;
  surveyDate: string;
  description: string;
}

const initialFormData: SurveyChartFormData = {
  surveyName: '',
  propertyAddress: '',
  surveyorName: '',
  surveyDate: '',
  description: ''
};

export function SurveyChartSection() {
  const [formData, setFormData] = useState<SurveyChartFormData>(initialFormData);
  const [surveyPoints, setSurveyPoints] = useState<SurveyPoint[]>([]);
  const [newPoint, setNewPoint] = useState({ name: '', latitude: '', longitude: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const handleInputChange = (field: keyof SurveyChartFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSurveyPoint = () => {
    if (!newPoint.name || !newPoint.latitude || !newPoint.longitude) {
      toast.error('Please fill in point name, latitude, and longitude');
      return;
    }

    const lat = parseFloat(newPoint.latitude);
    const lng = parseFloat(newPoint.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Please enter valid coordinates');
      return;
    }

    const point: SurveyPoint = {
      id: Date.now().toString(),
      name: newPoint.name,
      latitude: lat,
      longitude: lng,
      description: newPoint.description
    };

    setSurveyPoints(prev => [...prev, point]);
    setNewPoint({ name: '', latitude: '', longitude: '', description: '' });

    // Add marker to map
    addMarkerToMap(point);
  };

  const removeSurveyPoint = (id: string) => {
    setSurveyPoints(prev => prev.filter(point => point.id !== id));

    // Remove marker from map
    const markerIndex = markersRef.current.findIndex(marker => marker.pointId === id);
    if (markerIndex !== -1) {
      const marker = markersRef.current[markerIndex];
      if (leafletMapRef.current && marker) {
        leafletMapRef.current.removeLayer(marker);
      }
      markersRef.current.splice(markerIndex, 1);
    }
  };

  const addMarkerToMap = (point: SurveyPoint) => {
    if (!leafletMapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const marker = L.marker([point.latitude, point.longitude])
      .addTo(leafletMapRef.current)
      .bindPopup(`<b>${point.name}</b><br/>${point.latitude}, ${point.longitude}${point.description ? `<br/>${point.description}` : ''}`);

    marker.pointId = point.id;
    markersRef.current.push(marker);
  };

  const initializeMap = async () => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    try {
      const L = await import('leaflet');

      // Load Leaflet CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Clear existing map
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      // Create map centered on Lagos, Nigeria
      const map = L.map(mapRef.current).setView([6.5244, 3.3792], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      leafletMapRef.current = map;

      // Add existing markers
      surveyPoints.forEach(point => addMarkerToMap(point));

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (surveyPoints.length === 0) {
      toast.error('Please add at least one survey point');
      return;
    }

    if (!formData.surveyName || !formData.propertyAddress) {
      toast.error('Please fill in survey name and property address');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      // Here you would implement the actual survey chart creation and saving
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmissionStatus('success');
      toast.success('Survey chart created successfully');

      // Reset form
      setFormData(initialFormData);
      setSurveyPoints([]);

      // Clear markers
      markersRef.current.forEach(marker => {
        if (leafletMapRef.current) {
          leafletMapRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

    } catch (error) {
      setSubmissionStatus('error');
      toast.error('Failed to create survey chart. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCoordinates = () => {
    if (surveyPoints.length === 0) {
      toast.error('No survey points to export');
      return;
    }

    const csvContent = [
      ['Point Name', 'Latitude', 'Longitude', 'Description'],
      ...surveyPoints.map(point => [
        point.name,
        point.latitude.toString(),
        point.longitude.toString(),
        point.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.surveyName || 'survey'}_coordinates.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Coordinates exported successfully');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-4 lg:space-y-6 order-2 lg:order-2">
        {/* Survey Information */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissionStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Survey Chart Created</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your survey chart has been created successfully. You can now export the coordinates.
                </p>
              </div>
            )}

            {submissionStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Creation Failed</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  There was an error creating your survey chart. Please try again.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surveyName">Survey Name *</Label>
                <Input
                  id="surveyName"
                  value={formData.surveyName}
                  onChange={(e) => handleInputChange('surveyName', e.target.value)}
                  placeholder="e.g., Plot 123 Survey"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address *</Label>
                <Input
                  id="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                  placeholder="Property location"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surveyorName">Surveyor Name</Label>
                <Input
                  id="surveyorName"
                  value={formData.surveyorName}
                  onChange={(e) => handleInputChange('surveyorName', e.target.value)}
                  placeholder="Name of surveyor"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surveyDate">Survey Date</Label>
                <Input
                  id="surveyDate"
                  type="date"
                  value={formData.surveyDate}
                  onChange={(e) => handleInputChange('surveyDate', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Survey description and notes..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Survey Points */}
        <Card>
          <CardHeader>
            <CardTitle>Add Survey Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointName">Point Name</Label>
                <Input
                  id="pointName"
                  value={newPoint.name}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Corner A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={newPoint.latitude}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="e.g., 6.5244"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={newPoint.longitude}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="e.g., 3.3792"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addSurveyPoint} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pointDescription">Description (Optional)</Label>
              <Input
                id="pointDescription"
                value={newPoint.description}
                onChange={(e) => setNewPoint(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional notes for this point"
              />
            </div>
          </CardContent>
        </Card>

        {/* Survey Points List */}
        {surveyPoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Survey Points ({surveyPoints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {surveyPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{point.name}</div>
                      <div className="text-sm text-gray-600">
                        {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                        {point.description && <span className="ml-2">• {point.description}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSurveyPoint(point.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={mapRef}
              className="w-full h-96 rounded-lg border"
              style={{ minHeight: '400px' }}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={exportCoordinates}
                disabled={surveyPoints.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Coordinates
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || surveyPoints.length === 0 || !formData.surveyName || !formData.propertyAddress}
              >
                {isSubmitting ? 'Creating Chart...' : 'Create Survey Chart'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Info & Features */}
      <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Survey Charting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Coordinate Plotting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Interactive Map</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Survey Point Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span>Data Export</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">How to Use</h4>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>• Enter survey point coordinates</li>
                <li>• Add descriptive names</li>
                <li>• View points on interactive map</li>
                <li>• Export coordinates as CSV</li>
                <li>• Save survey chart</li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Coordinate Format</h4>
              <p className="text-xs text-gray-600">
                Latitude: -90 to 90
                <br />
                Longitude: -180 to 180
                <br />
                Use decimal degrees (e.g., 6.5244, 3.3792)
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Processing Time</h4>
              <p className="text-xs text-gray-600">
                Charting: 1 week
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Current Points</h4>
              <Badge variant="secondary">
                {surveyPoints.length} point{surveyPoints.length !== 1 ? 's' : ''} plotted
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}