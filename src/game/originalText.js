import rawDocument from "../../docs/scenario-v2.txt?raw";

function slice(start, end) {
  const aliases = {
    "### B — 진입": "### 프롤로그-문앞",
    "#### 선택 1-1 — 첫 조우": "#### 1장-첫조우",
    "#### 선택 1-2 — 안내판 (복선①)": "#### 1장-안내판 (복선①)",
    "#### 선택 2-1 — 유리 규칙": "#### 2장-유리",
    "#### 선택 2-2 — 갈림길 (복선②)": "#### 2장-갈림길 (복선②)",
    "#### 선택 3-1 — 이전 루프의 흔적 (트위스트 핵심)": "#### 3장-흔적 (트위스트 핵심)",
    "#### 선택 3-2 — 첫 시험 (관계도 초기값)": "#### 3장-시험 (관계도 초기값)",
    "#### 키보드 (트위스트 복선 — 확정)": "#### 4장-키보드 (트위스트 복선)",
    "#### 선택 7-2 — 메시지 (A/B 선택 시)": "#### 7장-메시지 (A/B 선택 시)"
  };
  start = aliases[start] || start;
  end = aliases[end] || end;
  const startIndex = rawDocument.indexOf(start);
  if (startIndex < 0) return "";
  const from = startIndex + start.length;
  let endIndex = end ? rawDocument.indexOf(end, from) : rawDocument.length;
  if (endIndex < 0 && end === "**[선택]**") endIndex = rawDocument.indexOf("`[CHOICE]`", from);
  if (endIndex < 0 && end === "**공통 규칙 제시**") endIndex = rawDocument.indexOf("[PAGE]", from);
  if (end && endIndex < 0) endIndex = rawDocument.length;
  return rawDocument.slice(from, endIndex);
}

// 설계 설명과 표를 제외하고, 저자가 게임 본문으로 표시한 인용문(>)만
// 문단 단위로 원형 보존한다.
export function quotePages(start, end) {
  const lines = slice(start, end).split(/\r?\n/);
  const pages = [];
  let page = [];
  let paragraph = [];
  const flush = () => {
    if (!paragraph.length) return;
    page.push(paragraph.join("\n").trim());
    paragraph = [];
  };
  const flushPage = () => {
    flush();
    if (page.length) pages.push(page.join("\n\n").trim());
    page = [];
  };
  for (const line of lines) {
    if (/설계 의도|연출 지시|구간 목표|\*\*핵심\*\*|\*\*역할\*\*|\*\*대가\*\*/.test(line)) {
      flushPage();
      break;
    }
    if (/\[CHOICE\]/.test(line)) {
      flushPage();
      break;
    }
    if (/\[PAGE\]/.test(line)) {
      flushPage();
      continue;
    }
    if (/^>\s?/.test(line)) {
      const content = line.replace(/^>\s?/, "");
      if (content.trim() && !/저 키보드랑 같은 걸 쓴 손이었다|안내판에 남아 있던 눌린 자국|개발 주의|획득 지점|숨은 선택지|엔딩용/.test(content.trim())) paragraph.push(content);
      else if (paragraph.length) flush();
    }
  }
  flushPage();
  return pages.filter((page, index) => pages.indexOf(page) === index);
}

export function joinPages(...groups) {
  return groups.flat().filter(Boolean);
}

const q = quotePages;

function quotePagesIn(scopeStart, scopeEnd, start, end) {
  const scoped = slice(scopeStart, scopeEnd);
  const markerAliases = {
    "**A 반응**": "`[A]`",
    "**A 반응** *(8번 엔딩 복선 포함 — 확정)*": "`[A]` *(8번 엔딩 복선 포함 — 필수)*",
    "**B 반응**": "`[B]`",
    "**C 반응**": "`[C]`",
    "**C 반응** *(신설 — 8번 엔딩 플래그)*": "`[C]`",
    "**A 추가 연출**": "`[A]`",
    "**B 반응** *(우회로 — 신설)*": "`[B]`",
    "**C 반응** *(신설 — 8번 엔딩 플래그)*": "`[C]`",
    "**C 반응** *(신설 — 8번 엔딩 플래그)*": "`[C]`",
    "#### C — 정보 공유 (전문)": "`[C]`",
    "**`FLAG_망설임`": "`[B]`"
  };
  start = markerAliases[start] || start;
  end = markerAliases[end] || end;
  const startIndex = scoped.indexOf(start);
  if (startIndex < 0) return [];
  const from = startIndex + start.length;
  let endIndex = end ? scoped.indexOf(end, from) : scoped.length;
  if (end && endIndex < 0) endIndex = scoped.length;
  const block = scoped.slice(from, endIndex);
  const pages = [];
  let page = [];
  let paragraph = [];
  const flush = () => {
    if (!paragraph.length) return;
    page.push(paragraph.join("\n").trim());
    paragraph = [];
  };
  const flushPage = () => {
    flush();
    if (page.length) pages.push(page.join("\n\n").trim());
    page = [];
  };
  for (const line of block.split(/\r?\n/)) {
    if (/설계 의도|연출 지시|구간 목표|\*\*핵심\*\*|\*\*역할\*\*|\*\*대가\*\*/.test(line)) {
      flushPage();
      break;
    }
    if (/\[CHOICE\]/.test(line)) {
      flushPage();
      break;
    }
    if (/\[PAGE\]/.test(line)) {
      flushPage();
      continue;
    }
    if (/^>\s?/.test(line)) {
      const content = line.replace(/^>\s?/, "");
      if (content.trim() && !/저 키보드랑 같은 걸 쓴 손이었다|안내판에 남아 있던 눌린 자국|개발 주의|획득 지점|숨은 선택지|엔딩용/.test(content.trim())) paragraph.push(content);
      else if (paragraph.length) flush();
    }
  }
  flushPage();
  return pages.filter((page, index) => pages.indexOf(page) === index);
}

const qi = quotePagesIn;

export const originalSceneText = {
  start: q("### 프롤로그-갈림길", "### 프롤로그-문앞"),
  prologue_work: q("### 프롤로그-문앞", "## 9. 1막 — 입고"),
  forced_entry: q("### 프롤로그-문앞", "## 9. 1막 — 입고"),
  ch1_entry: q("### 9-1. 1장 — 입고", "#### 1장-첫조우"),
  ch1_worker: q("#### 1장-첫조우", "#### 1장-안내판 (복선①)"),
  ch1_sign: q("#### 1장-안내판 (복선①)", "### 9-2. 2장 — 통로"),
  ch2_glass: q("#### 2장-유리", "#### 2장-갈림길 (복선②)"),
  ch2_path: q("#### 2장-갈림길 (복선②)", "### 9-3. 3장 — 명패실"),
  ch3_note: q("#### 3장-흔적 (트위스트 핵심)", "#### 3장-시험 (관계도 초기값)"),
  ch3_attack: q("#### 3장-시험 (관계도 초기값)", "#### 3장-판정"),
  ch3_result: q("#### 3장-판정", "## 10. 2막 — 심사"),
  ch4_register: q("#### 4장-등록소", "#### 4장-키보드 (트위스트 복선)"),
  ch4_keyboard: q("#### 4장-키보드 (트위스트 복선)", "### 10-2. 5장 — 동조"),
  ch5_sync: joinPages(
    q("### 10-2. 5장 — 동조", "### 10-3. 6장 — 후보"),
  ),
  ch6_candidates: joinPages(
    q("### 10-3. 6장 — 후보", "### 10-4. 7장 — 자판기")
  ),
  ch7_machine: q("#### 7장-자판기", "#### 7장-메시지"),
  ch7_message: q("#### 7장-메시지", "## 11. 3막 — 판정"),
  ch8_queue: q("#### 8장-대기열", "### 11-2. 9장 — 재심사-D"),
  ch8_send: q("#### 8장-대기열", "### 11-2. 9장 — 재심사-D"),
  ch8_recheck: q("#### 9장-재심사 (default — 8장 B 경로)", "#### 9장-키스"),
  ch9_kiss: q("#### 9장-키스 (공통 합류 지점 — D는 여기로 직행)", "#### 9장-분기 — 판정 우선순위"),
  // 고백 본문은 최종 선택지와 중복되므로, 선택 후 엔딩 장면에서만 출력한다.
  finalChoice: []
};

export const originalResponses = {
  "ch1_worker:0": qi("#### 1장-첫조우", "#### 1장-안내판 (복선①)", "`[A]`", "`[B]`"),
  "ch1_worker:1": qi("#### 1장-첫조우", "#### 1장-안내판 (복선①)", "`[B]`", "`[C]`"),
  "ch1_worker:2": qi("#### 1장-첫조우", "#### 1장-안내판 (복선①)", "`[C]`", null),
  "ch1_sign:0": qi("#### 1장-안내판 (복선①)", "### 9-2. 2장 — 통로", "`[A]`", "`[C]`"),
  "ch2_glass:0": qi("#### 선택 2-1 — 유리 규칙", "#### 선택 2-2", "**A 반응** *(8번 엔딩 복선 포함 — 확정)*", "**B 반응**"),
  "ch2_glass:1": qi("#### 선택 2-1 — 유리 규칙", "#### 선택 2-2", "**B 반응**", "**공통 규칙 제시**"),
  "ch2_path:0": qi("#### 선택 2-2 — 갈림길 (복선②)", "---", "**A 추가 연출**", "**B 반응**"),
  "ch2_path:1": qi("#### 선택 2-2 — 갈림길 (복선②)", "---", "**B 반응**", null),
  "ch3_note:1": qi("#### 선택 3-1 — 이전 루프의 흔적 (트위스트 핵심)", "#### 선택 3-2", "**B 반응**", null),
  "ch3_attack:0": qi("#### 3장-시험 (관계도 초기값)", "#### 3장-판정", "`[A]`", "`[C]`"),
  "ch3_attack:2": qi("#### 3장-시험 (관계도 초기값)", "#### 3장-판정", "`[C]`", null),
  "ch4_register:0": qi("### 10-1. 4장 — 등록소", "#### 키보드", "**A 반응**", "**B 반응**"),
  "ch4_register:1": qi("### 10-1. 4장 — 등록소", "#### 키보드", "**B 반응** *(우회로 — 신설)*", "**중요**"),
  "ch5_sync:0": qi("### 10-2. 5장 — 동조", "### 10-3. 6장", "**A 반응**", "**`FLAG_망설임`"),
  "ch5_sync:2": qi("### 10-2. 5장 — 동조", "### 10-3. 6장", "**C 반응**", null),
  "ch6_candidates:0": qi("### 10-3. 6장 — 후보", "### 10-4. 7장", "**A 반응**", "**B 반응**"),
  "ch6_candidates:1": qi("### 10-3. 6장 — 후보", "### 10-4. 7장", "**B 반응**", "#### C — 정보 공유"),
  "ch6_candidates:2": qi("### 10-3. 6장 — 후보", "### 10-4. 7장", "#### C — 정보 공유 (전문)", "> **설계 의도**"),
  "ch7_machine:0": qi("#### 7장-자판기", "#### 7장-메시지", "[A]", "[C]"),
  "ch7_machine:2": qi("#### 7장-자판기", "#### 7장-메시지", "[C]", null),
  "ch7_message:2": qi("#### 7장-메시지", "## 11. 3막", "[C]", null),
  "ch8_queue:0": qi("#### 8장-대기열", "### 11-2. 9장 — 재심사-D", "[A]", "[B]"),
  "ch8_queue:1": qi("#### 8장-대기열", "### 11-2. 9장 — 재심사-D", "[B]", "[C]"),
  "ch8_queue:2": qi("#### 8장-대기열", "### 11-2. 9장 — 재심사-D", "[C]", "[D]"),
  "ch8_queue:3": qi("#### 8장-대기열", "### 11-2. 9장 — 재심사-D", "[D]", null)
};

export const originalEndingText = {
  ending0: q("### A — 엔딩 0", "### B — 진입"),
  ending3: [],
  ending6: [],
  ending7: [],
  ending9a: [],
  ending9b: [],
  ending10: [],
  ending12: []
};

export const sourceAudit = {
  documentCharacters: rawDocument.length,
  sceneParagraphs: Object.values(originalSceneText).reduce((n, pages) => n + pages.length, 0),
  responseParagraphs: Object.values(originalResponses).reduce((n, pages) => n + pages.length, 0),
  endingParagraphs: Object.values(originalEndingText).reduce((n, pages) => n + pages.length, 0)
};
