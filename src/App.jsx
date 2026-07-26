import React, { useEffect, useMemo, useRef, useState } from "react";
import { chapters, scenario } from "./game/scenario";
import { endings } from "./game/endings";
import {
  INITIAL_STATE, applyEffects, forcedEnding, isChoiceVisible, resolveFinal, secretEnding
} from "./game/rules";

function renderRichText(value) {
  const normalized = String(value)
    .replace(/(^|\n)\s*\*?\s*개체\.\s*(?=\n|$)/g, "$1")
    .replace(/\*\*관계자 외 출입금지\*\*/g, "@@RELATION_RESTRICTED@@")
    .replace(/관계자 외 출입금지/g, "@@RELATION_RESTRICTED@@")
    .replace(/\*\*\\_+ 아쿠아리움 · 개장 예정\*\*/g, "@@AQUARIUM_SIGN@@")
    .replace(/_+ 아쿠아리움 · 개장 예정/g, "@@AQUARIUM_SIGN@@")
    .replace(/(?:\\_\s*){3,}아쿠아리움 · 개장 예정/g, "@@AQUARIUM_SIGN@@")
    .replace(/아쿠아리움 · 개장 예정/g, "@@AQUARIUM_SIGN@@")
    .replace(/\\\s*(?=@@AQUARIUM_SIGN@@)/g, "")
    .replace(/\\_/g, "")
    .replace(/\n\s*\*+\s*/g, "\n")
    .replace(/^\s*\*+\s*/g, "")
    .replace(/\*(["“])/g, "$1")
    .replace(/(["”])\*/g, "$1")
    // 원문 마크다운의 단일 별표(이탤릭 표기)는 게임 화면에 표시하지 않는다.
    .replace(/\*/g, "")
    .replace(/\\_/g, "");
  const pieces = normalized.split(/(@@RELATION_RESTRICTED@@|@@AQUARIUM_SIGN@@|\*\*[^*]+\*\*|"[^"]*")/g);
  return pieces.map((piece, index) => {
    if (!piece) return null;
    if (piece === "@@RELATION_RESTRICTED@@") {
      return <React.Fragment key={index}><br /><span className="scene-sign restricted">[관계자 외 출입금지]</span><br /></React.Fragment>;
    }
    if (piece === "@@AQUARIUM_SIGN@@") {
      return <React.Fragment key={index}><br /><span className="scene-sign aquarium-sign">___아쿠아리움 · 개장 예정</span><br /></React.Fragment>;
    }
    if (piece.startsWith("**") && piece.endsWith("**")) {
      return <React.Fragment key={index}><br /><span className="emphasis">{piece.slice(2, -2).replaceAll("\\_", "_")}</span><br /></React.Fragment>;
    }
    if (piece.startsWith('"') && piece.endsWith('"')) {
      return <React.Fragment key={index}><br /><span className="dialogue">{piece}</span><br /></React.Fragment>;
    }
    return <React.Fragment key={index}>{piece}</React.Fragment>;
  });
}

// 이름님 엔딩의 유일한 저장 예외.
// 버전별 키를 사용해 이전 테스트 기록이 새 빌드의 첫 화면을 오염시키지 않게 한다.
const SECRET_KEY = "unopenedAquarium_v070_nameLordSeen";
const DEATH_ARMED_KEY = "unopenedAquarium_deathArmed";
const DEATH_STEPS = 5;
const DEATH_ROUTE = [
  ["prologue_work", "ch1_entry"],
  ["ch1_entry", "ch3_note"],
  ["ch3_note", "ch5_sync"],
  ["ch5_sync", "ch8_queue"],
  ["ch8_queue", null],
];

function Meter({ label, value, min = 0, max = 100, bipolar = false, corrupt }) {
  const position = ((value - min) / (max - min)) * 100;
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>{!bipolar && <span>{value}</span>}
      </div>
      {bipolar && <div className="meter-ends"><span>김솔음</span><span>백사헌</span></div>}
      <div className={`meter-track ${bipolar ? "bipolar" : ""} ${corrupt ? "corrupt" : ""}`}>
        {bipolar
          ? <span className="control-dot" style={{ left: `${position}%` }} />
          : <span className="meter-fill" style={{ width: `${position}%` }} />}
      </div>
    </div>
  );
}

function StatusBar({ state, corrupt }) {
  const labels = corrupt
    ? ["숭배", "복종", "은총"]
    : ["관계도", "주도권", "오염도"];
  return (
    <section className="status" aria-label="현재 상태">
      <Meter label={labels[0]} value={state.relationship} corrupt={corrupt} />
      <Meter label={labels[1]} value={state.control} min={-100} max={100} bipolar corrupt={corrupt} />
      <Meter label={labels[2]} value={state.contamination} corrupt={corrupt} />
    </section>
  );
}

function DevPanel({ state, setState, currentId, endingId, jump }) {
  const [open, setOpen] = useState(false);
  const update = (key, value) => setState((prev) => ({ ...prev, [key]: Number(value) }));
  return (
    <aside className={`dev-panel ${open ? "open" : ""}`}>
      <button className="dev-toggle" onClick={() => setOpen(!open)}>
        {open ? "개발 패널 닫기" : "개발 패널"}
      </button>
      {open && <div className="dev-content">
        <p><b>장면</b> {currentId}{endingId ? ` / ${endingId}` : ""}</p>
        {["relationship", "control", "contamination"].map((key) => (
          <label key={key}>{key}
            <input type="number" value={state[key]} min={key === "control" ? -100 : 0}
              max="100" onChange={(e) => update(key, e.target.value)} />
          </label>
        ))}
        <p><b>플래그</b></p>
        <code>{state.flags.length ? state.flags.join("\n") : "(없음)"}</code>
        <p><b>장면 이동</b></p>
        <select value={currentId} onChange={(e) => jump(e.target.value)}>
          {Object.keys(scenario).map((id) => <option value={id} key={id}>{id}</option>)}
        </select>
      </div>}
    </aside>
  );
}

export default function App() {
  const audioRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [currentId, setCurrentId] = useState("start");
  const [state, setState] = useState(INITIAL_STATE);
  const [endingId, setEndingId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [responsePages, setResponsePages] = useState([]);
  const [pendingChoice, setPendingChoice] = useState(null);
  const [nameLordSeen, setNameLordSeen] = useState(
    () => localStorage.getItem(SECRET_KEY) === "true"
  );
  const [deathArmed, setDeathArmed] = useState(
    () => localStorage.getItem(DEATH_ARMED_KEY) === "true"
  );
  const [deathProgress, setDeathProgress] = useState(0);

  const node = scenario[currentId];
  const ending = endingId ? endings[endingId] : null;
  const corrupt = ending?.corrupt;
  const choices = useMemo(() => {
    const visible = (node?.choices || []).filter((choice) => isChoiceVisible(choice, state));
    if (deathArmed && !endingId && DEATH_ROUTE[deathProgress]?.[0] === currentId) {
      visible.push({ label: "모두 삭제한다", action: "deathDelete" });
    }
    return visible;
  }, [node, state, deathArmed, deathProgress, currentId, endingId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentId, endingId]);

  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

  async function playMusic() {
    if (!audioRef.current) {
      const audio = new Audio(`${import.meta.env.BASE_URL}audio/0726.MP3`);
      audio.loop = true;
      audio.volume = 0.38;
      audioRef.current = audio;
    }
    try {
      await audioRef.current.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
  }

  function toggleMusic() {
    if (!audioRef.current || audioRef.current.paused) {
      playMusic();
      return;
    }
    audioRef.current.pause();
    setMusicPlaying(false);
  }

  function end(id) {
    if (id === "ending11") {
      localStorage.setItem(SECRET_KEY, "true");
      setNameLordSeen(true);
    }
    if (id === "ending4") {
      localStorage.removeItem(DEATH_ARMED_KEY);
      localStorage.removeItem(SECRET_KEY);
      setDeathArmed(false);
      setNameLordSeen(false);
    }
    setEndingId(id);
    setPageIndex(0);
    setResponsePages([]);
    setPendingChoice(null);
  }

  function commitChoice(choice) {
    if (choice.action === "deathDelete") {
      const progress = deathProgress + 1;
      setDeathProgress(progress);
      if (progress >= DEATH_STEPS) return end("ending4");
      setCurrentId(DEATH_ROUTE[deathProgress][1]);
      setPageIndex(0);
      setResponsePages([]);
      setPendingChoice(null);
      return;
    }
    let nextState = choice.__applied ? state : applyEffects(state, choice.effects);
    if (choice.centerControl && !choice.__applied) nextState.control = Math.round(nextState.control / 2);
    if (!choice.__applied) nextState.history = [...nextState.history, { node: currentId, label: choice.label }];
    setState(nextState);
    setPageIndex(0);
    setResponsePages([]);
    setPendingChoice(null);
    if (choice.ending) return end(choice.ending);
    if (choice.final) return end(resolveFinal(choice.final, nextState));
    if (choice.action === "openFinal") {
      const forced = forcedEnding(nextState, { atChapter9: true });
      if (forced) return end(forced);
      setCurrentId("finalChoice");
      return;
    }
    if (choice.action === "resolveSend") {
      if (secretEnding(nextState)) return end("ending11");
      if (nextState.contamination >= 76) return end("ending10");
      return end(nextState.relationship >= 71 && nextState.flags.includes("FLAG_기억")
        ? "ending9b" : "ending5");
    }
    if (choice.action === "resolveTimeout") {
      if (secretEnding(nextState)) return end("ending11");
      if (nextState.contamination >= 76) return end("ending10");
      return end(nextState.relationship >= 71 && nextState.flags.includes("FLAG_기억")
        ? "ending9b" : "ending5");
    }
    if (choice.action === "resolveProtect") {
      if (secretEnding(nextState)) return end("ending11");
      if (nextState.contamination >= 76) return end("ending7");
      return end(nextState.relationship >= 71 && nextState.flags.includes("FLAG_기억")
        ? "ending9b" : "ending5");
    }
    if (choice.action === "resolveLead") {
      if (secretEnding(nextState)) return end("ending11");
      if (nextState.contamination >= 76) return end("ending10");
      return end(nextState.relationship >= 71 && nextState.flags.includes("FLAG_기억")
        ? "ending9b" : "ending5");
    }
    if (choice.next) setCurrentId(choice.next);
  }

  function choose(choice) {
    if (choice.disabled) return;
    const pages = choice.responsePages || (choice.response ? [choice.response] : []);
    if (pages.length) {
      let nextState = applyEffects(state, choice.effects);
      if (choice.centerControl) nextState.control = Math.round(nextState.control / 2);
      nextState.history = [...nextState.history, { node: currentId, label: choice.label }];
      setState(nextState);
      setResponsePages(pages);
      setPendingChoice({ ...choice, __applied: true });
      setPageIndex(0);
      return;
    }
    commitChoice(choice);
  }

  function nextPage() {
    const pages = responsePages.length ? responsePages : node.text;
    if (pageIndex < pages.length - 1) {
      setPageIndex((index) => index + 1);
    } else if (responsePages.length && pendingChoice) {
      commitChoice(pendingChoice);
    }
  }

  function restart() {
    if (deathArmed) {
      localStorage.removeItem(DEATH_ARMED_KEY);
      localStorage.removeItem(SECRET_KEY);
      setDeathArmed(false);
      setNameLordSeen(false);
      setDeathProgress(0);
    }
    setCurrentId("start");
    setState(INITIAL_STATE);
    setEndingId(null);
    setPageIndex(0);
    setResponsePages([]);
    setPendingChoice(null);
    setStarted(true);
  }

  function returnToTitle() {
    setCurrentId("start");
    setState(INITIAL_STATE);
    setEndingId(null);
    setPageIndex(0);
    setResponsePages([]);
    setPendingChoice(null);
    setShowNotice(false);
    localStorage.setItem(DEATH_ARMED_KEY, "true");
    setDeathArmed(true);
    setDeathProgress(0);
    setStarted(false);
  }

  if (!started) {
    if (showNotice) {
      return (
        <main className="title-screen">
          <div className="title-card notice-card">
            <p className="eyebrow">입장 전 안내</p>
            <p className="notice-text">
              입장 전 안내 드립니다.<br />
              본 게임은 2차 창작이며,<br />
              카카오페이지 웹소설<br />
              ‘괴담에 떨어져도 출근을 해야 하는구나’<br />
              395화 이후의 시점을 다루고 있습니다.<br /><br />
              스포일러에 주의해 주세요.
            </p>
            <button className="primary" onClick={() => {
              setShowNotice(false);
              setDeathProgress(0);
              setStarted(true);
              playMusic();
            }}>
              확인하고 입장하기
            </button>
          </div>
        </main>
      );
    }
    return (
      <main className={`title-screen ${nameLordSeen ? "haunted" : ""}`}>
        <div className="title-card">
          <p className="eyebrow">괴담 생존 심리 로맨스 · 인터랙티브 소설</p>
          <h1>{nameLordSeen ? "[이름님] 수족관" : "미개장 수족관"}</h1>
          <p className="logline">백사헌 X 김솔음<br />2차 창작 인터랙티브 소설</p>
          <button className="primary" onClick={() => setShowNotice(true)}>
            {nameLordSeen ? "[시작님]" : "입장하기"}
          </button>
          <p className="copyright">
            본 게임은 「괴담에 떨어져도 출근을 해야 하는구나」의 비영리 2차 창작이며,<br />
            원작과 아무런 관련이 없습니다.<br />
            2차 창작 · 비영리 · 무료 배포
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={`game ${corrupt ? "corruption-max" : ""} ${ending?.death ? "death-ending" : ""}`}>
      {(corrupt || ending?.death) && <div className={`horror-fill ${ending?.death ? "death-fill" : "name-fill"}`} aria-hidden="true">
        {ending?.death
          ? Array.from({ length: 420 }, (_, i) => <span key={i}>死</span>)
          : Array.from({ length: 72 }, (_, i) => <span key={i}>{i % 3 === 2 ? "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" : "ㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏ"}</span>)}
      </div>}
      <header className="game-header">
        <button className="wordmark" onClick={() => setStarted(false)}>미개장 수족관</button>
        <div className="header-actions">
          <span>{ending ? "결말" : chapters[node.chapter]}</span>
          <button className="music-toggle" onClick={toggleMusic} aria-label={musicPlaying ? "배경음악 끄기" : "배경음악 켜기"}>
            {musicPlaying ? "음악 끄기" : "음악 켜기"}
          </button>
        </div>
      </header>
      <StatusBar state={state} corrupt={corrupt} />

      <article className={`story-card ${ending ? "ending-card" : ""}`} aria-live="polite">
        {ending ? <>
          <p className="ending-kind">{ending.kind}</p>
          <h2>엔딩 {ending.number}. {ending.title}</h2>
          <div className="divider" />
          <p>{renderRichText(ending.text[pageIndex])}</p>
          {pageIndex < ending.text.length - 1 &&
            <button className="primary next" onClick={() => setPageIndex((i) => i + 1)}>다음</button>}
          {pageIndex === ending.text.length - 1 && !String(ending.text[pageIndex]).includes("-fin-") &&
            <p className="fin">-fin-</p>}
          {pageIndex === ending.text.length - 1 && <div className="credits">
            <p>개발자 : @myammmma</p>
            <p>시나리오 : @myammmma</p>
            <p>원작 소설 : 괴담에 떨어져도 출근을 해야 하는구나 | 백덕수</p>
          </div>}
          {pageIndex === ending.text.length - 1 && endingId === "ending11" &&
            <button className="choice danger" onClick={returnToTitle}>처음 화면으로</button>}
          {pageIndex === ending.text.length - 1 && endingId !== "ending11" &&
            <button className="primary restart" onClick={restart}>처음부터</button>}
        </> : <>
          <p className="chapter-label">{chapters[node.chapter]}</p>
          <h2>{node.title}</h2>
          <div className="divider" />
          <p className={responsePages.length ? "response" : ""}>
            {renderRichText((responsePages.length ? responsePages : node.text)[pageIndex])}
          </p>
          {responsePages.length > 0 || pageIndex < node.text.length - 1
            ? <button className="primary next" onClick={nextPage}>다음</button>
            : <div className="choices">
            {choices
              .filter((choice, index, list) => list.findIndex((item) => item.label === choice.label) === index)
              .filter((choice) => !choice.todo)
              .filter((choice) => !String(choice.label || "").includes("TODO"))
              .filter((choice) => !String(choice.label || "").includes("이름을 적어본다"))
              .map((choice, i) => (
              <button key={`${choice.label}-${i}`}
                className={`choice ${choice.disabled ? "disabled" : ""}`}
                disabled={choice.disabled} onClick={() => choose(choice)}>
                <span>{choice.label}</span>
                {choice.todo && <small>TODO · {choice.todo}</small>}
              </button>
            ))}
          </div>}
        </>}
      </article>
      <footer>
        <span>대화 기록 {state.history.length}</span>
        <span>v0.7.4</span>
      </footer>
    </main>
  );
}
