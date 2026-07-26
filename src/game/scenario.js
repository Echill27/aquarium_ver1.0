import { originalResponses, originalSceneText } from "./originalText";

// 대사·장면·선택지는 이 파일에서 수정합니다.
// 문서에서 미확정으로 남은 연결부는 TODO 라벨을 유지합니다.
export const chapters = {
  prologue: "프롤로그 · 환풍구",
  ch1: "1장 · 입고",
  ch2: "2장 · 통로",
  ch3: "3장 · 명패실",
  ch4: "4장 · 등록소",
  ch5: "5장 · 동조",
  ch6: "6장 · 후보",
  ch7: "7장 · 자판기",
  ch8: "8장 · 방출 대기열",
  ch9: "9장 · 재심사",
};

export const scenario = {
  start: {
    chapter: "prologue",
    title: "갈림길",
    text: [
      "갈림길이다. 김솔음은 귀에 끼고 있던 소리 차단용 이어플러그를 의미없이 꾹꾹 누르고선, 뒤를 돌아보았다.",
      "백사헌이 과장된 입모양으로 뻐끔거렸다.",
      "“어디로 가?”",
      "왼쪽은 숙소동. 내 방으로 가는 방향이다. 오른쪽은 아직 마감이 안 된 작업자 구역이다. 조명도 절반만 들어와 있다.",
      "아까 백사헌이 말하길, CCTV가 달려 있지 않은 부분이 많다고 했던가. 그래도 위험은 감수해야 할 것 같다."
    ],
    choices: [
      { label: "김솔음의 방으로 간다", ending: "ending0" },
      { label: "작업자 구역으로 간다", next: "prologue_work" }
    ]
  },
  prologue_work: {
    chapter: "prologue",
    title: "관계자 외 출입금지",
    text: [
      "나는 오른쪽으로 걸었다. 제대로 마감되지 않은 구간을 지나 백사헌의 도움을 받아 바닥에 착지했다.",
      "전에 백사헌이 날 끌어당겨 숨기고 작업자 스케줄을 건넸던 장소가 눈에 들어왔다.",
      "관계자 외 출입금지.",
      "백사헌은 품에서 무언가 꺼내 문에 쑤석거리더니 익숙하게 문을 열었다.",
      "“먼저 갈게요.”",
      "“잠깐. 기다려, 뭐가 있을지 모르니까—”",
      "“그쪽은 내가 아직도 애송이 주임으로 보이나 보죠.”"
    ],
    choices: [
      { label: "문을 연다", next: "ch1_entry", effects: { contamination: 3 } },
      { label: "돌아간다", next: "forced_entry" }
    ]
  },
  forced_entry: {
    chapter: "prologue",
    title: "돌아갈 수 없다",
    text: ["돌아가려던 방향에도 같은 문이 있었다.", "따로 선택권은 없었다."],
    choices: [{ label: "문을 연다", next: "ch1_entry", effects: { contamination: 3 } }]
  },
  ch1_entry: {
    chapter: "ch1", title: "입고",
    text: [
      "나는 문을 닫았다. 딸깍, 하는 소리가 유난히 크게 났다.",
      "문이 없었다. 손잡이가 있던 자리에는 매끈한 벽만 있었다. 어디에선가 물 소리가 들렸다.",
      "천장은 높고 조명은 파랬다. 통로 양옆의 유리벽 안은 비어 있었다.",
      "“...수족관?”",
      "정면 벽에 안내판이 걸려 있었다.\n___아쿠아리움 · 개장 예정\n이름 자리가 비어 있었다.",
      "“입고 확인. 개체 A, 개체 B. 두 개체 확인되었습니다. 쌍 단위 입고 조건 충족. 심사를 시작합니다.”",
      "개체. 백사헌과 나는 눈을 마주쳤다. 튀자!"
    ],
    choices: [{ label: "통로를 살핀다", next: "ch1_worker" }]
  },
  ch1_worker: {
    chapter: "ch1", title: "첫 조우",
    text: [
      "직원 유니폼을 입은 것이 통로 저편에서 걸어왔다. 어깨부터 발끝까지 물이 떨어졌다.",
      "하지만 신발을 신은 발은 드라이기로 말린 듯 보송했다."
    ],
    choices: [
      { label: "“내가 앞에 설게.”", next: "ch1_sign", effects: { control: -15, addFlags: ["FLAG_선도1"] }, response: "“그쪽이 왜 앞에 서요.” “뒤로 가라.” “백사헌.” 그가 반 발짝 물러섰다." },
      { label: "백사헌이 먼저 나서게 둔다", next: "ch1_sign", effects: { control: 15, addFlags: ["FLAG_백사헌선도1"] }, response: "“내가 할게요.” 정말 적응 안 되네." },
      { label: "“백사헌, 아래쪽을 봐.”", next: "ch1_sign", effects: { control: -10, contamination: -5 }, response: "“발이 뭐요.” “안 젖었어. 물은 떨어지는데.” “다른 어둠에 진입한 것 같죠.”" }
    ]
  },
  ch1_sign: {
    chapter: "ch1", title: "빈 이름 자리",
    text: [
      "그것이 완전히 사라진 다음 안내판 앞에 섰다.",
      "비어 있는 이름 자리 아래쪽에 누군가 손으로 눌러쓴 자국이 있었다. 글씨는 지워졌지만 눌린 자국은 남아 있었다."
    ],
    choices: [
      { label: "자국을 만져본다", next: "ch2_glass", effects: { addFlags: ["FLAG_안내판", "FLAG_안내판기입"], contamination: 3 }, response: "획이 몇 개 잡혔다. 두 글자나 세 글자쯤. 전에 여기 끌려온 사람은 어디로 간 거지." },
      { label: "그냥 지나간다", next: "ch2_glass", effects: { contamination: 3 }, response: "백사헌이 뒤에 남아 자국을 봤다." },
    ]
  },
  ch2_glass: {
    chapter: "ch2", title: "유리 규칙",
    text: [
      "끝없는 빈 수조가 복도를 채우고 있었다. 어느 수조 안쪽에서 뭔가 움직였다.",
      "나는 무의식적으로 홀린 듯 손을 유리벽에 가져다댔다."
    ],
    choices: [
      { label: "백사헌이 손을 잡아챈다", next: "ch2_path", effects: { relationship: 10, control: 10, addFlags: ["FLAG_백사헌선도2"] }, response: "“손대지 마요. 저건 아직 아무것도 아니니까.” 그는 손에 자국이 남을 만큼 꽉 쥐었다. “저기 문처럼 생긴 거 보이죠. 문 아니니까.”" },
      { label: "스스로 손을 거둔다", next: "ch2_path", effects: { control: -5, addFlags: ["FLAG_선도2"] }, response: "“그냥. 잘했어요.” 얘 진짜 왜 이래." }
    ]
  },
  ch2_path: {
    chapter: "ch2", title: "갈림길",
    text: [
      "“유리에 손대지 마십시오. 개체가 놀랍니다.”",
      "그런데 이 통로에 개체는 우리 둘밖에 없는 것 아닌가.",
      "통로가 갈라졌다. 왼쪽은 좁은 정비 통로, 오른쪽은 넓은 관람 통로였다. 익숙한 기시감이 들었다."
    ],
    choices: [
      { label: "정비 통로로 간다", next: "ch3_note", effects: { contamination: 8, addFlags: ["FLAG_손자국"] }, response: "벽의 소금기 어린 손자국에 손을 덮었다. 크기가 정확히 들어맞았다. 내 손과." },
      { label: "관람 통로로 간다", next: "ch3_note", effects: { contamination: 3 }, response: "“그쪽 꽤나 사람 짜증나게 만드는 거 알아요? 나 없으면 진짜 어쩌려고…”" }
    ]
  },
  ch3_note: {
    chapter: "ch3", title: "꼼꼼하게 접힌 종이",
    text: [
      "명패 보관실 탁자 위에 종이가 하나 놓여 있었다. 모서리가 자로 잰 것처럼 딱 떨어졌다.",
      "그 옆의 짧은 메모. ‘이 방법 안 먹힘.’ 무슨 방법인지는 적혀 있지 않았다."
    ],
    choices: [
      { label: "“누가 여기 있었나 봐.”", next: "ch3_attack" },
      { label: "“이 낙서 필체가… 낯익은데.”", next: "ch3_attack", effects: { contamination: -5, addFlags: ["FLAG_종이"] }, response: "“너 글씨 이렇게 쓰잖아.” 백사헌은 부정하면서도 종이에서 눈을 떼지 못했다." }
    ]
  },
  ch3_attack: {
    chapter: "ch3", title: "첫 시험",
    text: ["명패실 안쪽에서 몸 전체에 이빨이 난 물고기 같은 것이 백사헌 쪽으로 날아왔다.", "반응할 시간은 0.5초쯤 있었다."],
    choices: [
      { label: "몸을 던져 백사헌을 밀어낸다", next: "ch3_result", effects: { relationship: 20, control: -10, addFlags: ["FLAG_선도3"] }, response: "나는 그를 밀어 넘어뜨렸다. “너 못 피했어. 이걸로 아까 나 살려준 거 갚은 거다.” “겨우 이걸로요?”" },
      { label: "“피해!” 소리쳐 유도한다", next: "ch3_result", effects: { relationship: 10 } },
      { label: "무서워 망설인다", next: "ch3_result", effects: { addFlags: ["FLAG_망설임"] }, response: "백사헌은 알아서 피했고, 나를 보고 살짝 실망한 얼굴로 몸을 돌렸다. 뭐야. 어쩌라고." }
    ]
  },
  ch3_result: {
    chapter: "ch3", title: "1차 판정",
    text: [
      "“1차 심사 결과를 안내드립니다.”",
      "개체 A ─ 적합. 개체 B ─ 부적합.",
      "“적합 개체는 사육 구역으로 이동해 주십시오. 부적합 개체는 방출 대기열에 등록되었습니다.”",
      "방출. 좋은 뜻일 리 없는데도 이상하게 안심이 됐다."
    ],
    choices: [{ label: "등록소로 이동한다", next: "ch4_register", effects: { contamination: 3 } }]
  },
  ch4_register: {
    chapter: "ch4", title: "등록소",
    text: ["“성명을 입력해 주십시오.”", "명찰 발급기의 입력 칸이 깜빡였다."],
    choices: [
      { label: "실명을 입력한다", next: "ch4_keyboard", effects: { contamination: 15, addFlags: ["FLAG_이름1"] }, response: "[김솔음]. 화면이 만족스럽게 깜빡였다. 뭔가 잘못했다는 감각이 늦게 왔다." },
      { label: "가짜 이름을 입력한다", next: "ch4_keyboard", effects: { addFlags: ["FLAG_손재주"] }, response: "백사헌이 패널을 떼고 배선을 바꿨다. 이름 없이 등록됐다. 그는 떼어낸 얇은 판을 주머니에 넣었다." }
    ]
  },
  ch4_keyboard: {
    chapter: "ch4", title: "닳은 키",
    text: [
      "키보드의 여섯 키가 유난히 닳아 있었다. r, t, d, q, t, g.",
      "많은 사람이 이름을 넣었다면 골고루 닳아야 정상이다. 아주 적은 수의 이름을 아주 여러 번 넣은 것 같았다."
    ],
    choices: [{ label: "측정실로 간다", next: "ch5_sync", effects: { contamination: 3 } }]
  },
  ch5_sync: {
    chapter: "ch5", title: "동조",
    text: [
      "“쌍 성립이 확인되면 재심사가 가능합니다. 두 개체는 접촉을 유지해 주십시오.”",
      "나는 백사헌이 행동하기 전에 먼저 그의 어깨를 감싸잡고, 좋은 향기가 나는 가슴팍에 얼굴을 묻었다.\n아무리 내가 영업 뛰면서 철면피 까는 스킬을 익혔다지만, 이런 말을 하려는 데에는 용기가 필요하지...\n좋아.\n감정 잡았다.\n“자기야-, 나 무서워어....”",
      "그의 심장이 아주 빠르게 뛰었다. 귓가에 입을 붙였다. “협조해라.”",
      "“나 사랑하지?”",
      "개체 B ─ 반응 확인. 개체 A ─ 변동 없음. 일방성 확인. 쌍 성립 불가.",
      "백사헌은 저 멀리 벽을 보고 있었다. “저거 고장 났네요.”"
    ],
    choices: [
      { label: "“설마 너—”", next: "ch6_candidates", effects: { relationship: 10, control: -5, contamination: 3 }, response: "“아니라고!” 그는 끝내 눈을 마주치지 않았다." },
      { label: "아무 말도 안 한다", next: "ch6_candidates", effects: { relationship: -5, contamination: 3 }, response: "백사헌의 침묵이 오래 남았다." },
      { label: "“다시 해보자.”", next: "ch6_candidates", effects: { relationship: 5, contamination: 8 }, response: "“고장이라고. 솔음아.” 이번에 고장 난 것은 백사헌이었고 결과는 같았다." }
    ]
  },
  ch6_candidates: {
    chapter: "ch6", title: "후보",
    text: [
      "비늘과 아름다운 꼬리를 가진 대체 후보 셋이 김솔음 옆에 자연스럽게 섰다. 잘 먹고, 잘 오염된 전시품이었다.",
      "백사헌은 그 옆에서 마르고 건조하고 아무 데도 안 어울리는 성격 나쁜 모습으로 서 있었다.",
      "“...짐작하고 있었어요?” “응.” “뭘 어디까지요.” “이 수족관이 날 마음에 들어 한다는 거.”"
    ],
    choices: [
      { label: "사실대로 말한다", next: "ch7_machine", effects: { relationship: 10, contamination: 3 }, response: "“가끔. 익숙해.” 백사헌은 그 말의 뜻을 알아들은 것 같았다." },
      { label: "대수롭지 않게 넘긴다", next: "ch7_machine", effects: { relationship: -5, contamination: 3 }, response: "“아마 나한테는 그럴만한 가치가 없을지도 모르죠.”" },
      { label: "정보를 공유한다", next: "ch7_machine", effects: { relationship: 25, control: -20, contamination: 13, addFlags: ["FLAG_정보공유", "FLAG_선도4"] }, response: "“네가 알아야 되니까 말한 거야. 널 믿으니까.” 백사헌은 반박할 말을 찾지 못했다." }
    ]
  },
  ch7_machine: {
    chapter: "ch7", title: "자판기",
    text: [
      "직원 휴게 코너의 낡은 자판기. 버튼에는 피, 미지근한 물, 소금물, 그리고 라벨 없는 버튼이 적혀 있었다.",
      "동전 투입구 위의 안내. ‘투입: 이름 한 글자 또는 기억 하나.’"
    ],
    choices: [
      { label: "이름의 한 글자를 넣는다", next: "ch7_message", effects: { contamination: 10, addFlags: ["FLAG_이름2"] }, response: "‘솔’이 빠져나갔다. 이름을 떠올리는 데 한 박자가 더 걸렸다. 라벨 없는 캔이 떨어졌다." },
      { label: "기억 하나를 넣는다", next: "ch7_message", effects: { contamination: 10, addFlags: ["FLAG_기억"] } },
      { label: "라벨 없는 버튼을 눌러본다", next: "ch8_queue", effects: { addFlags: ["FLAG_라벨없음"], contamination: 3 }, response: "배출구에서 바깥 냄새의 바람이 나왔다. “그거 누르지 마요. 저런 건 원래—”", route: { messageSkipped: true } },
      { label: "아무것도 넣지 않는다", next: "ch8_queue", effects: { contamination: 3 } }
    ]
  },
  ch7_message: {
    chapter: "ch7", title: "메시지",
    text: ["캔 바닥에 짧은 문장을 새겨 보낼 수 있다.", "받는 사람이 자판기를 사용하면 그 메시지가 적힌 음료를 뽑는다."],
    choices: [
      { label: "사무적으로 쓴다", next: "ch8_queue", effects: { contamination: 3, route: { messageTone: "formal" } } },
      { label: "감정을 담아 쓴다", next: "ch8_queue", effects: { relationship: 10, contamination: 3, route: { messageTone: "emotional" } } },
      { label: "백사헌에게 보여주고 같이 쓴다", next: "ch8_queue", effects: { relationship: 15, contamination: 3, route: { centerControl: true } }, centerControl: true, response: "백사헌은 캔을 한참 들고 있었다. 김솔음에게 뭐라고 썼는지는 보여주지 않고 자판기에 넣었다." }
    ]
  },
  ch8_queue: {
    chapter: "ch8", title: "방출 대기열",
    text: [
      "“심사가 종료되었습니다. 부적합 개체 B, 방출 대기열 1번. 3분 후 처리됩니다.”",
      "방출 대기열 1 ─ 개체 B.",
      "아까까지 답답했던 공기가 점점 편해지고 있었다. 오염의 징조였다.",
      "3분. 오염이 심해지기 전에 백사헌을 내보내야 한다.",
      "2분 47초."
    ],
    choices: [
      { label: "백사헌을 보낸다", next: "ch8_send", effects: { relationship: -10, route: { chapter8Choice: "A" } } },
      { label: "재심사를 요구한다", next: "ch8_recheck", effects: { contamination: 5, route: { chapter8Choice: "B" } } },
      { label: "수족관과 협상한다", next: "ch8_send", when: { flag: "FLAG_정보공유" }, effects: { control: -20, contamination: 15, route: { chapter8Choice: "C" } } },
      { label: "백사헌이 앞장서게 둔다", next: "ch8_send", effects: { control: 25, contamination: 20, route: { chapter8Choice: "D", baekLeads: true } } },
    ]
  },
  ch8_send: {
    chapter: "ch8", title: "보낸다",
    text: [
      "“가. 네 이름 올라가 있잖아. 백사헌. 가라고.”",
      "“그쪽은요.”",
      "“나가서 날 구할 방법을 찾아봐. 너는 가만있으면 살아.”",
      "백사헌은 핏발 선 눈으로 날 노려봤다. 아무래도 어렵나 보다."
    ],
    choices: [
      { label: "그를 밀어낸다", action: "resolveSend" },
      { label: "시간이 흐르도록 둔다", action: "resolveTimeout" },
      { label: "백사헌을 말린다", action: "resolveProtect", effects: { control: -10, contamination: 20, route: { protectBaek: true } } },
      { label: "백사헌이 앞서게 둔다", action: "resolveLead", effects: { control: -15, contamination: 20, route: { solEumLead: true } } }
    ]
  },
  ch8_recheck: {
    chapter: "ch8", title: "이의 신청",
    text: [
      "“쌍 성립되면 재심사 된다며. 한번 더 해 줄 수 있어?”",
      "“너 지금 무슨 짓을 하고 있는지 알아?”",
      "“알아요. 내가 나가면 그쪽 혼자 남잖아요.”",
      "“김솔음. 나 믿는다고 했잖아요. 한번만 믿어 줘요.”",
      "1분 12초.",
      "“이의 신청이 접수되었습니다. 두 개체는 측정실로 이동해 주십시오.”",
      "대기열에서 이름이 지워졌다."
    ],
    choices: [{ label: "측정실로 돌아간다", next: "ch9_kiss", effects: { contamination: 3 } }]
  },
  ch9_kiss: {
    chapter: "ch9", title: "재심사",
    text: [
      "다시 이 방이었다. 같은 부스, 같은 조명. 아까는 연기했고 기계는 백사헌의 진심을 벽에 띄웠다.",
      "“백사헌. 이리 와. 키스해줘.”",
      "“...연기로는 안 된다는 거네요.”",
      "“어. 이제 안 하려고. 연기하는 거.”",
      "백사헌은 한 발, 또 한 발 다가왔다. “나중에 딴소리하기 없습니다.”",
      "따뜻한 입술이 닿았다. 약한 멘솔 향이 났다. 서로의 심장이 빠르게 뛰었다.",
      "개체 A ─ 반응 확인. 개체 B ─ 반응 확인. 쌍 성립.",
      "“적합 쌍으로 확정되었습니다. 두 개체를 사육 구역으로 이동합니다.”",
      "성공했다. 그리고 둘 다 이곳에 갇히게 됐다."
    ],
    choices: [
      { label: "판정을 확인한다", action: "openFinal" }
    ]
  },
  finalChoice: {
    chapter: "ch9", title: "처리 방법",
    text: ["수족관이 두 개체의 다음 처리를 기다리고 있다."],
    choices: [
      { label: "말한다 — “나 너 좋아해.”", final: "A", when: { maxContamination: 35 } },
      { label: "말하지 않는다", final: "B", when: { maxContamination: 65 } },
      { label: "백사헌을 밀어낸다", final: "C" },
      { label: "이곳을 받아들인다", final: "D", when: { minContamination: 66 } },
      { label: "라벨 없는 버튼으로 간다", final: "E", when: { flag: "FLAG_라벨없음" } }
    ]
  }
};

// v2.0 설계 원문에서 추출한 페이지로 축약문을 교체한다.
for (const [nodeId, pages] of Object.entries(originalSceneText)) {
  if (scenario[nodeId] && pages.length) scenario[nodeId].text = pages;
}
for (const [key, pages] of Object.entries(originalResponses)) {
  const [nodeId, choiceIndex] = key.split(":");
  const choice = scenario[nodeId]?.choices?.[Number(choiceIndex)];
  if (choice && pages.length) {
    choice.responsePages = pages;
    delete choice.response;
  }
}

export const unresolvedTodos = [
  "FLAG_이름부정 획득 지점",
  "7장 메시지의 실제 문면",
  "엔딩 3·12의 전용 진입 경로",
  "엔딩 10의 명확한 진입 시점",
  "오염도 수치 밸런싱",
  "루프 트위스트를 명시적으로 밝히는 장면"
];
