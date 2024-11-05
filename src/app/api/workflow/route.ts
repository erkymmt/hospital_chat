import { NextResponse } from 'next/server';

// リクエストの型を定義
interface WorkflowRequest {
  inputs: {
    [key: string]: any;
  };
}

// POSTリクエストでワークフローを実行する部分
export async function POST(req: Request) {
  try {
    // 型アサーションを使用して、bodyの型を明示的に指定
    const body = await req.json() as WorkflowRequest;
    console.log('Incoming request body:', body);

    const workflowUrl = `${process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT}/workflows/run`;
    console.log('Calling Dify at:', workflowUrl);

    const difyResponse = await fetch(workflowUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_WORKFLOW_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: body.inputs,
        response_mode: 'streaming',
        user: 'default-user'
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

// GETリクエストでワークフローの状態を取得する部分
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workflowId = searchParams.get('workflow_id');

  if (!workflowId) {
    return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
  }

  try {
    const workflowUrl = `${process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT}/workflows/run/${workflowId}`;
    console.log('Fetching workflow status from:', workflowUrl);

    const response = await fetch(workflowUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_WORKFLOW_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching workflow status:', errorText);
      return NextResponse.json(
        { error: 'Error fetching workflow status', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Workflow status response:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
