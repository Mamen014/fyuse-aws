import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userEmail, source, timestamp } = await request.json();

    if (!userEmail || !source || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would typically save this to your database
    // For now, we'll just log it and return success
    console.log('User source tracked:', { userEmail, source, timestamp });

    return NextResponse.json(
      { message: 'Source tracked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error tracking user source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 