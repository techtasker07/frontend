import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const propertyId = formData.get('propertyId') as string

    console.log('Virtual Tour Upload: Received request with data:', {
      filesCount: files?.length,
      propertyId
    })

    if (!files || files.length === 0) {
      console.error('Virtual Tour Upload: No files provided')
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.error('Virtual Tour Upload: NEXT_PUBLIC_SUPABASE_URL not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let supabaseClient
    if (supabaseServiceKey) {
      console.log('Virtual Tour Upload: Using service role key')
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      console.warn('Virtual Tour Upload: SUPABASE_SERVICE_ROLE_KEY not configured, using anon key')
      supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file || !file.name || !file.type || !file.size) {
        console.error(`Virtual Tour Upload: Invalid file data for file ${i + 1}`)
        continue
      }

      try {
        // Convert file to buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const fileName = file.name

        // Generate unique filename for virtual tour images
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const extension = fileName.split('.').pop() || 'jpg'
        const uniqueFileName = `virtual-tour-${propertyId || 'temp'}-${timestamp}-${randomId}.${extension}`

        console.log(`Virtual Tour Upload: Uploading file ${i + 1}: ${uniqueFileName}`)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('property-images') // Using property-images bucket
          .upload(`virtual_tour_images/${uniqueFileName}`, fileBuffer, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) {
          console.error(`Virtual Tour Upload: Upload error for file ${i + 1}:`, uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = supabaseClient.storage
          .from('property-images')
          .getPublicUrl(`virtual_tour_images/${uniqueFileName}`)

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl)
          console.log(`Virtual Tour Upload: Successfully uploaded file ${i + 1}: ${urlData.publicUrl}`)
        } else {
          console.error(`Virtual Tour Upload: Failed to get public URL for file ${i + 1}`)
        }

      } catch (fileError: any) {
        console.error(`Virtual Tour Upload: Error processing file ${i + 1}:`, fileError)
        continue
      }
    }

    if (uploadedUrls.length === 0) {
      console.error('Virtual Tour Upload: No files were successfully uploaded')
      return NextResponse.json(
        { success: false, error: 'Failed to upload any files' },
        { status: 500 }
      )
    }

    console.log(`Virtual Tour Upload: Successfully uploaded ${uploadedUrls.length} of ${files.length} files`)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedUrls.length} virtual tour image(s)`,
      data: {
        urls: uploadedUrls
      }
    })

  } catch (error: any) {
    console.error('Virtual Tour Upload: Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}