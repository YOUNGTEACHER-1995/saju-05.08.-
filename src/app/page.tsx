"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { RefreshCw, Copy, Sparkles } from "lucide-react";

export default function Home() {
  const [gender, setGender] = useState("male");
  const [calendarType, setCalendarType] = useState("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return alert("생년월일을 입력해주세요.");
    if (!isTimeUnknown && !birthTime) return alert("태어난 시간을 입력하시거나 '시간 모름'을 체크해주세요.");

    setLoading(true);
    setResult("");
    setIsFinished(false);

    try {
      // 1. 사주 변환 및 AI 요청 (API 라우트 호출)
      const res = await fetch("/api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          calendarType,
          isLeapMonth,
          birthDate,
          birthTime: isTimeUnknown ? null : birthTime,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "서버 오류가 발생했습니다.");
      }

      // 2. 스트리밍 응답 처리
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setResult((prev) => prev + chunk);
        }
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setIsFinished(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert("결과가 클립보드에 복사되었습니다.");
  };

  const resetForm = () => {
    setResult("");
    setIsFinished(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>운수좋은 웹</h1>
        <p>AI가 분석해주는 현대적이고 따뜻한 사주풀이</p>
      </header>

      {!result && !loading ? (
        <form className={`glass-panel fade-in ${styles.formCard}`} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>성별</label>
            <div className={styles.inputGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                  style={{ display: "none" }}
                />
                <span>남성</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                  style={{ display: "none" }}
                />
                <span>여성</span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>역법</label>
            <div className={styles.inputGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="calendar"
                  value="solar"
                  checked={calendarType === "solar"}
                  onChange={() => {
                    setCalendarType("solar");
                    setIsLeapMonth(false);
                  }}
                  style={{ display: "none" }}
                />
                <span>양력</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="calendar"
                  value="lunar"
                  checked={calendarType === "lunar"}
                  onChange={() => setCalendarType("lunar")}
                  style={{ display: "none" }}
                />
                <span>음력</span>
              </label>
            </div>
            {calendarType === "lunar" && (
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                />
                윤달입니다
              </label>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>생년월일</label>
            <input
              type="date"
              className={styles.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>태어난 시간</label>
            <input
              type="time"
              className={styles.input}
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              disabled={isTimeUnknown}
            />
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isTimeUnknown}
                onChange={(e) => {
                  setIsTimeUnknown(e.target.checked);
                  if (e.target.checked) setBirthTime("");
                }}
              />
              태어난 시간을 모릅니다
            </label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "우주의 기운을 읽는 중..." : "사주 분석하기"}
          </button>
        </form>
      ) : (
        <div className={`glass-panel fade-in ${styles.resultCard}`}>
          <div className={styles.resultHeader}>
            <h2><Sparkles size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />당신의 사주 이야기</h2>
          </div>
          
          <div className={styles.markdownContent}>
            {/* 실제 마크다운 파서(예: react-markdown)를 쓰면 좋지만, 우선 줄바꿈만 처리 */}
            {result.split("\n").map((line, i) => {
              if (line.startsWith("### ")) return <h3 key={i}>{line.replace("### ", "")}</h3>;
              if (line.startsWith("## ")) return <h3 key={i}>{line.replace("## ", "")}</h3>;
              if (line.startsWith("# ")) return <h2 key={i}>{line.replace("# ", "")}</h2>;
              if (line.startsWith("🌟") || line.startsWith("👤") || line.startsWith("💰") || line.startsWith("💡")) {
                return <h3 key={i}>{line}</h3>;
              }
              return <p key={i}>{line}</p>;
            })}
            {loading && <span className="animate-pulse">|</span>}
          </div>

          {isFinished && (
            <div className={styles.actionButtons}>
              <button className={styles.secondaryBtn} onClick={copyToClipboard}>
                <Copy size={18} /> 결과 복사하기
              </button>
              <button className={styles.secondaryBtn} onClick={resetForm}>
                <RefreshCw size={18} /> 다시 하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
