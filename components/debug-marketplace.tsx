'use client';

import React, { useState } from 'react';
import { supabaseApi } from '../lib/supabase-api';

const DebugMarketplace = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runBasicTest = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      console.log('🚀 Starting marketplace debug test...');
      
      // Test 1: Try the simplest possible query
      const result = await supabaseApi.getMarketplaceListings({ limit: 5 });
      
      console.log('📊 Test results:', result);
      
      setTestResults({
        success: result.success,
        dataCount: result.data?.length || 0,
        data: result.data,
        error: result.error,
        timestamp: new Date().toLocaleString()
      });
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectSupabaseQuery = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      console.log('🚀 Testing direct Supabase query...');
      
      // Import supabase client directly
      const { supabase } = await import('../lib/supabase');
      
      // Test direct query
      const { data, error, count } = await supabase
        .from('marketplace_listings')
        .select('*', { count: 'exact' })
        .limit(5);
      
      console.log('📊 Direct query results:', { data, error, count });
      
      setTestResults({
        success: !error,
        dataCount: data?.length || 0,
        totalCount: count,
        data: data,
        error: error?.message,
        queryType: 'direct',
        timestamp: new Date().toLocaleString()
      });
      
    } catch (error) {
      console.error('❌ Direct test failed:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        queryType: 'direct',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔧 Marketplace Debug Tool</h1>
        
        <div className="mb-6 space-x-4">
          <button
            onClick={runBasicTest}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '⏳ Testing...' : '🧪 Test API Method'}
          </button>
          
          <button
            onClick={testDirectSupabaseQuery}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '⏳ Testing...' : '🔍 Test Direct Query'}
          </button>
        </div>

        {testResults && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              {testResults.success ? '✅ Test Results' : '❌ Test Failed'}
            </h2>
            
            <div className="space-y-2 text-sm">
              <div><strong>Success:</strong> {testResults.success ? 'Yes' : 'No'}</div>
              <div><strong>Data Count:</strong> {testResults.dataCount}</div>
              {testResults.totalCount !== undefined && (
                <div><strong>Total Count:</strong> {testResults.totalCount}</div>
              )}
              {testResults.queryType && (
                <div><strong>Query Type:</strong> {testResults.queryType}</div>
              )}
              <div><strong>Timestamp:</strong> {testResults.timestamp}</div>
              
              {testResults.error && (
                <div className="text-red-600">
                  <strong>Error:</strong> {testResults.error}
                </div>
              )}
            </div>
            
            {testResults.data && testResults.data.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">📋 Sample Data:</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(testResults.data[0], null, 2)}
                </pre>
              </div>
            )}
            
            {testResults.data && testResults.data.length > 1 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">📋 All Records (IDs):</h3>
                <div className="flex flex-wrap gap-2">
                  {testResults.data.map((item: any, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 rounded text-xs">
                      {item.id || `Record ${index + 1}`}: {item.title?.substring(0, 20) || 'No title'}...
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugMarketplace;
