// API configuration and utilities - now using Supabase
// Re-exporting from supabase-api for backward compatibility

export type {
  ApiResponse,
  User,
  Property,
  ProspectProperty,
  PropertyProspect,
  PropertyImage,
  Vote,
  VoteOption,
  Category,
  VoteStatistics,
  PropertyStats
} from './supabase-api';

export { supabaseApi as api } from './supabase-api';
