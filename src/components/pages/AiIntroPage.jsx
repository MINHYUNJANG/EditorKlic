const featureCards = [
  {
    number: '01',
    title: 'AI 인트로 질문',
    text: '학부모와 학생이 자연어로 질문하면 관련 메뉴, 공지, FAQ, 페이지를 즉시 안내합니다.',
    examples: ['반편성 어디서 봐요?', '오늘 급식 뭐예요?', '방과후 신청 어디서 하나요?'],
  },
  {
    number: '02',
    title: '메인 바로가기 강화',
    text: '자주 쓰는 기능을 카드형 UI로 전면 배치하여 복잡한 메뉴 탐색 단계를 줄입니다.',
    examples: ['반 편성 조회', '급식 식단', '학사일정', '가정통신문'],
  },
  {
    number: '03',
    title: '반편성·이벤트 빠른 확인',
    text: '입학, 개학, 축제, 설명회 등 주요 시점의 정보를 팝업 또는 알림 영역으로 즉시 제공합니다.',
    examples: ['입학 시즌 반편성', '운동회', '학교 축제', '학부모 설명회'],
  },
  {
    number: '04',
    title: '시즌·이벤트 스킨',
    text: '계절, 날씨, 학교 행사에 맞춰 메인 화면 분위기를 유연하게 전환합니다.',
    examples: ['봄·여름·가을·겨울', '입학식', '졸업식', '축제 스킨'],
  },
];

const effects = [
  '정보 탐색 단계 감소',
  '반복 문의 감소',
  '모바일 접근성 강화',
  '학교 홈페이지 참여도 향상',
];


export default function AiIntroPage() {
  return (
    <main className="ai-intro-page">
      <section className="ai-intro-header">
        <h2 className="crawl-title">AI 인트로</h2>
        <p className="crawl-desc">
          학교통합 메인을 가볍게 구성하고, 학부모/학생이 원하는 메뉴와 정보를 빠르게 찾을 수 있도록 돕는 인트로 기능입니다.
        </p>
      </section>

      <section className="ai-intro-content">
        <div className="ai-intro-hero">
          <div className="ai-intro-hero-left">
            <div className="ai-intro-hero-copy">
              <span className="ai-intro-kicker">기획 방향</span>
              <h3>학교 홈페이지를 필요한 정보를 바로 찾는 사용자 중심 인트로로 전환</h3>
              <p>
                복잡한 메뉴 구조와 반복 문의를 줄이고, 학부모와 학생이 메인 화면에서 질문, 바로가기,
                행사 안내, 시즌 스킨을 한 번에 이용할 수 있도록 구성합니다.
              </p>
            </div>
            <div className="ai-intro-flow" aria-label="AI 인트로 처리 흐름">
              <div>
                <strong>질문 입력</strong>
                <span>자연어 검색</span>
              </div>
              <div>
                <strong>AI 분석</strong>
                <span>메뉴·공지 매칭</span>
              </div>
              <div>
                <strong>즉시 안내</strong>
                <span>답변·페이지 이동</span>
              </div>
            </div>
          </div>
          <div className="ai-intro-hero-image">
            <img src="/ai_intro.png" alt="AI 인트로 메인 화면 목업" />
          </div>
        </div>

        <div className="ai-intro-section">
          <div className="ai-intro-section-head">
            <span>Background</span>
            <h3>추진 배경</h3>
          </div>
          <div className="ai-intro-problem-grid">
            <div>
              <strong>복잡한 메뉴 구조</strong>
              <p>반 편성, 가정통신문, 급식, 일정, 방과후 신청 등이 여러 메뉴 안쪽에 분산되어 있습니다.</p>
            </div>
            <div>
              <strong>정보 접근 단계 증가</strong>
              <p>사용자는 원하는 정보를 찾기 위해 여러 화면을 이동해야 하고, 모바일에서는 피로도가 더 커집니다.</p>
            </div>
            <div>
              <strong>반복 문의 증가</strong>
              <p>자주 묻는 질문이 전화나 민원으로 반복되어 학교 업무 부담이 늘어납니다.</p>
            </div>
          </div>
        </div>

        <div className="ai-intro-section">
          <div className="ai-intro-section-head">
            <span>Goal</span>
            <h3>추진 목적</h3>
          </div>
          <div className="ai-intro-goal-map">
            <div className="ai-intro-goal-core">쉽고 빠른 학교 정보 접근</div>
            <div>AI 질문 검색</div>
            <div>메인 화면 간소화</div>
            <div>모바일 최적화</div>
            <div>시즌·행사 스킨</div>
          </div>
        </div>

        <div className="ai-intro-section">
          <div className="ai-intro-section-head">
            <span>Features</span>
            <h3>주요 기능</h3>
          </div>
          <div className="ai-intro-feature-grid">
            {featureCards.map(feature => (
              <article className="ai-intro-feature-card" key={feature.number}>
                <span>{feature.number}</span>
                <h4>{feature.title}</h4>
                <p>{feature.text}</p>
                <div>
                  {feature.examples.map(example => <em key={example}>{example}</em>)}
                </div>
              </article>
            ))}
          </div>
          <div className="ai-intro-season-preview">
            <p className="ai-intro-season-label">시즌·날씨별 스킨 미리보기</p>
            <img src="/ai_weat.png" alt="봄·여름·가을·겨울 시즌 스킨 4종" />
          </div>
        </div>

        <div className="ai-intro-section ai-intro-section--split">
          <div>
            <div className="ai-intro-section-head">
              <span>Effect</span>
              <h3>기대 효과</h3>
            </div>
            <ul className="ai-intro-effect-list">
              {effects.map(effect => <li key={effect}>{effect}</li>)}
            </ul>
          </div>
          <div>
            <div className="ai-intro-section-head">
              <span>Use Case</span>
              <h3>활용 예시</h3>
            </div>
            <div className="ai-intro-usecase">
              <p><strong>“반편성”</strong> 검색 시 해당 조회 페이지로 즉시 이동합니다.</p>
              <p><strong>“급식”</strong> 검색 시 오늘의 식단 정보를 바로 확인합니다.</p>
              <p>학교 축제 기간에는 축제 전용 스킨과 이벤트 배너를 자동 적용합니다.</p>
            </div>
          </div>
        </div>

<div className="ai-intro-vision">
          <strong>기대 비전</strong>
          <p>
            학교 홈페이지를 단순 정보 제공 공간이 아니라 학부모, 학생, 교직원이 필요한 정보를 즉시 찾고
            빠르게 이동하는 차세대 사용자 중심 플랫폼으로 전환합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
