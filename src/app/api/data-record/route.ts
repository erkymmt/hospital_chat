import { NextRequest, NextResponse } from 'next/server';

// リクエストの型を定義
interface DataRecordRequest {
  inputs: {
    input: string;
  };
}

// POSTリクエストでデータ記録を実行する部分
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as DataRecordRequest;
    console.log('Incoming request body:', body);

    const dataRecordUrl = `${process.env.NEXT_PUBLIC_DIFY_DATA_RECORD_ENDPOINT}/chat-messages`;
    console.log('Calling Dify at:', dataRecordUrl);

    const difyResponse = await fetch(dataRecordUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_DATA_RECORD_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {}, // 必要に応じて入力を設定
        query: body.inputs.input,
        response_mode: 'streaming',
        conversation_id: '',
        user: 'abc-123',
        files: [
          {
            type: 'image',
            transfer_method: 'remote_url',
            url: 'https://cloud.dify.ai/logo/logo-site.png'
          }
        ]
      }),
    });

    console.log('Dify response status:', difyResponse.status);

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Dify error:', errorText);
      return NextResponse.json(
        { error: 'Dify API Error', details: errorText },
        { status: difyResponse.status }
      );
    }

    const responseStream = difyResponse.body;
    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
