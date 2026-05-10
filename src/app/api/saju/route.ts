import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Solar, Lunar } from "lunar-javascript";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gender, calendarType, isLeapMonth, birthDate, birthTime } = body;

    if (!birthDate) {
      return NextResponse.json({ error: "생년월일이 필요합니다." }, { status: 400 });
    }

    const [year, month, day] = birthDate.split("-").map(Number);
    let hour = null;
    let minute = null;

    if (birthTime) {
      const [h, m] = birthTime.split(":").map(Number);
      hour = h;
      minute = m;
    }

    let lunarObj;
    if (calendarType === "solar") {
      const solar = Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
      lunarObj = solar.getLunar();
    } else {
      // lunar
      lunarObj = Lunar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
      // Note: lunar-javascript has a way to handle leap months, but for simplicity we'll just use the date.
    }

    const baZi = lunarObj.getEightChar();
    const yearGanZhi = baZi.getYear();
    const monthGanZhi = baZi.getMonth();
    const dayGanZhi = baZi.getDay();
    const timeGanZhi = hour !== null ? baZi.getTime() : "모름(삼주육자)";

    const sajuData = `${yearGanZhi}년 ${monthGanZhi}월 ${dayGanZhi}일 ${timeGanZhi}시`;

    const prompt = `당신은 20년 경력의 명리학자이자 심리 상담가입니다. 사용자의 사주팔자 데이터가 주어지면, 어려운 한자어나 명리학 용어(비견, 겁재 등)를 남발하지 않고 현대인이 이해하기 쉽고 위로가 되는 따뜻한 말투로 풀이해 주세요.

사용자 정보:
- 성별: ${gender === "male" ? "남성" : "여성"}
- 사주팔자 (만세력): ${sajuData}

출력 형식 (반드시 아래 Markdown 형식을 지켜주세요. 그 외의 인사말이나 부연 설명은 생략합니다.):

🌟 한 줄 요약
[올해의 기운을 요약하는 긍정적인 한 문장]

👤 나의 기본 성향
[성격의 장단점과 특징]

💰 재물 및 직업
[강점을 살릴 수 있는 분야와 재물운]

💡 올해의 조언
[실천하기 좋은 구체적이고 따뜻한 팁]`;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Saju API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
