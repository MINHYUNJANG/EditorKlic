export default [
  {
    id: 'symbol-list',
    category: '상징',
    label: '상징 tyA (리스트형)',
    desc: '세로 나열 + 배경텍스트 + 교가 섹션',
    code: `<script>
$(function () {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": function () {

      /* 일반 box */
      $(".symbol .box:not(.song-wrap)").each(function (i) {
        const box = $(this);
        const img = box.find(".img");
        const inner = box.find(".inner");
        const text = box.find(".bg-text");
        const isEven = i % 2 === 1;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: box[0],
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        });

        tl.from(img, { y: 80, opacity: 0, duration: 0.8 })
          .from(inner, { x: isEven ? -60 : 60, opacity: 0, duration: 0.8 }, "-=0.6")
          .from(text, { x: isEven ? -60 : 60, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6");
      });

      /* song-wrap */
      const $songBox = $(".symbol .box.song-wrap");
      const tlSong = gsap.timeline({
        scrollTrigger: { trigger: $songBox[0], start: "top 80%" }
      });
      tlSong.from($songBox.find(".tit-wrap"), { y: 60, opacity: 0, duration: 0.7 })
            .from($songBox.find(".inner"), { y: 60, opacity: 0, duration: 0.7 }, "-=0.3");
    }
  });
});
<\/script>

<div class="symbol tyA list">
  <div class="symbol-sticky">
    <div class="slogan">
      <h4>교훈</h4>
      <p><strong>○○ &middot; ○○ &middot; ○○</strong>을 가꾸는 <strong>어린이</strong></p>
    </div>
  </div>

  <div class="list-wrap">
    <div class="box">
      <p class="img"><img src="/common/images/sub_com/symbol_temp1.png" alt="교표 이미지"></p>
      <div class="inner">
        <h4>교표</h4>
        <p>○○학교의 교표입니다.</p>
      </div>
      <p class="bg-text">Emblem</p>
    </div>
    <div class="box">
      <p class="img"><img src="/common/images/sub_com/symbol_temp2.png" alt="교기 이미지"></p>
      <div class="inner">
        <h4>교기</h4>
        <p>○○학교의 교기입니다.</p>
      </div>
      <p class="bg-text">Flag</p>
    </div>
    <div class="box">
      <p class="img"><img src="/common/images/sub_com/symbol_temp3.png" alt="교화 이미지"></p>
      <div class="inner">
        <h4>교화 <span>○○</span></h4>
        <p>교화에 대한 설명을 입력하세요.</p>
      </div>
      <p class="bg-text">Flower</p>
    </div>
    <div class="box">
      <p class="img"><img src="/common/images/sub_com/symbol_temp4.png" alt="교목 이미지"></p>
      <div class="inner">
        <h4>교목 <span>○○</span></h4>
        <p>교목에 대한 설명을 입력하세요.</p>
      </div>
      <p class="bg-text">Tree</p>
    </div>
    <div class="box song-wrap">
      <div class="tit-wrap">
        <h4>교가</h4>
        <div class="btn-wrap">
          <button class="btn-st pri">교가듣기</button>
          <button class="btn-st sec">악보다운로드</button>
        </div>
      </div>
      <div class="inner">
        <div class="img"><p class="rsp_img"><img src="/common/images/sub_com/symbol_song.png" alt="악보 이미지"></p></div>
        <div class="lyr">
          <h5>교가 1절</h5>
          <p>가사 1절 내용을 입력하세요.</p>
          <h5>교가 2절</h5>
          <p>가사 2절 내용을 입력하세요.</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'symbol-slide',
    category: '상징',
    label: '상징 tyA (슬라이드형)',
    desc: '가로 핀 스크롤 슬라이드 + 교가 섹션',
    code: `<script>
$(function () {
  gsap.registerPlugin(ScrollTrigger);

  const $section = $(".symbol.tyA.slide");
  const $scroll = $(".h-scroll");
  const $wrap = $(".list-wrap");

  function init() {
    ScrollTrigger.getAll().forEach(t => t.kill());
    gsap.set([$scroll, $section, ".symbol-sticky"], { clearProps: "all" });

    const $boxes = $scroll.find(".box");
    const isLowCount = $boxes.length <= 3;

    if (window.innerWidth <= 1240 || isLowCount) {
      isLowCount ? $wrap.addClass("dis-scroll") : $wrap.removeClass("dis-scroll");
      return;
    }

    $scroll.removeClass("dis-scroll");

    const scrollAmount = $scroll[0].scrollWidth - $wrap.outerWidth() + 100;
    if (scrollAmount <= 0) return;

    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: $section,
        start: "top top",
        end: () => "+=" + scrollAmount,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });

    mainTimeline.to($scroll, { x: -scrollAmount, ease: "none" });
    mainTimeline.to(".symbol-sticky", { y: 0, ease: "none" }, 0);
  }

  init();

  let resizeTimer;
  $(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 250);
  });
});
<\/script>

<div class="symbol tyA slide">
  <div class="sybmbol-wrap">
    <div class="symbol-sticky">
      <div class="slogan">
        <h4>교훈</h4>
        <p><strong>○○ &middot; ○○ &middot; ○○</strong>을 가꾸는 <strong>어린이</strong></p>
      </div>
    </div>

    <div class="list-wrap">
      <div class="list-sticky">
        <div class="scroll-wrap">
          <div class="h-scroll">
            <div class="box">
              <p class="img"><img src="/common/images/sub_com/symbol_temp1.png" alt="교표 이미지"></p>
              <div class="inner">
                <h4>교표</h4>
                <p>○○학교의 교표입니다.</p>
              </div>
            </div>
            <div class="box">
              <p class="img"><img src="/common/images/sub_com/symbol_temp2.png" alt="교기 이미지"></p>
              <div class="inner">
                <h4>교기</h4>
                <p>○○학교의 교기입니다.</p>
              </div>
            </div>
            <div class="box">
              <p class="img"><img src="/common/images/sub_com/symbol_temp3.png" alt="교화 이미지"></p>
              <div class="inner">
                <h4>교화 <span>○○</span></h4>
                <p>교화에 대한 설명을 입력하세요.</p>
              </div>
            </div>
            <div class="box">
              <p class="img"><img src="/common/images/sub_com/symbol_temp4.png" alt="교목 이미지"></p>
              <div class="inner">
                <h4>교목 <span>○○</span></h4>
                <p>교목에 대한 설명을 입력하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="box song-wrap">
    <div class="tit-wrap">
      <h4>교가</h4>
      <div class="btn-wrap">
        <button class="btn-st pri">교가듣기</button>
        <button class="btn-st sec">악보다운로드</button>
      </div>
    </div>
    <div class="inner">
      <div class="img"><p class="rsp_img"><img src="/common/images/sub_com/symbol_song.png" alt="악보 이미지"></p></div>
      <div class="lyr">
        <h5>교가 1절</h5>
        <p>가사 1절 내용을 입력하세요.</p>
        <h5>교가 2절</h5>
        <p>가사 2절 내용을 입력하세요.</p>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'symbol-tyB1',
    category: '상징',
    label: '상징 tyB_1',
    desc: '세로 나열 + 펼쳐보기 토글 + 교가',
    code: `<script>
$(function () {
  $('.btn-toggle').on('click', function () {
    const $box = $(this).closest('.text-box');
    $box.toggleClass('open');
    $(this).text($box.hasClass('open') ? '접기' : '펼쳐보기');
    $(this).toggleClass('open', $box.hasClass('open'));
  });

  $('.text-box').each(function () {
    const $text = $(this).find('p');
    const $btn = $(this).find('.btn-toggle');
    const lineHeight = parseFloat($text.css('line-height'));
    if ($text[0].scrollHeight <= lineHeight * 3) {
      $btn.hide();
    }
  });
});
<\/script>

<div class="symbol tyB tyB_1">
  <div class="box">
    <div class="inner">
      <p class="slogan">○○ · ○○ · ○○을 가꾸는 어린이</p>
    </div>
  </div>
  <div class="box">
    <p class="img mark"><img src="/common/images/sub_com/symbol_tyB_temp1.png" alt="교표 이미지"></p>
    <div class="inner">
      <h4>교표</h4>
      <div class="text-box">
        <p>교표에 대한 설명을 입력하세요.</p>
        <button class="btn-toggle">펼쳐보기</button>
      </div>
    </div>
  </div>
  <div class="box">
    <p class="img"><img src="/common/images/sub_com/symbol_temp3.png" alt="교화 이미지"></p>
    <div class="inner">
      <h4>교화<span>○○</span></h4>
      <div class="text-box">
        <p>교화에 대한 설명을 입력하세요.</p>
        <button class="btn-toggle">펼쳐보기</button>
      </div>
    </div>
  </div>
  <div class="box">
    <p class="img"><img src="/common/images/sub_com/symbol_temp4.png" alt="교목 이미지"></p>
    <div class="inner">
      <h4>교목<span>○○</span></h4>
      <div class="text-box">
        <p>교목에 대한 설명을 입력하세요.</p>
        <button class="btn-toggle">펼쳐보기</button>
      </div>
    </div>
  </div>
  <div class="box song-wrap">
    <h4>교가</h4>
    <div class="inner">
      <div class="img">
        <h5>○○학교 교가</h5>
        <p class="rsp_img"><img src="/common/images/sub_com/symbol_song.png" alt="악보 이미지"></p>
      </div>
      <div class="song-cont">
        <div class="lyr">
          <h5>교가 1절</h5>
          <p>가사 1절 내용을 입력하세요.</p>
          <h5>교가 2절</h5>
          <p>가사 2절 내용을 입력하세요.</p>
        </div>
        <div class="btn-wrap">
          <button class="btn-st pri">교가듣기</button>
          <button class="btn-st sec">악보다운로드</button>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'symbol-tyB2',
    category: '상징',
    label: '상징 tyB_2',
    desc: '스티키 슬로건 + 카드 나열 + 교가',
    code: `<script>
$(function () {
  $('.btn-toggle').on('click', function () {
    const $box = $(this).closest('.text-box');
    $box.toggleClass('open');
    $(this).text($box.hasClass('open') ? '접기' : '펼쳐보기');
    $(this).toggleClass('open', $box.hasClass('open'));
  });

  $('.text-box').each(function () {
    const $text = $(this).find('p');
    const $btn = $(this).find('.btn-toggle');
    const lineHeight = parseFloat($text.css('line-height'));
    if ($text[0].scrollHeight <= lineHeight * 3) {
      $btn.hide();
    }
  });
});
<\/script>

<div class="symbol tyB tyB_2">
  <div class="symbol-sticky">
    <h4>○○ · ○○ · ○○을 가꾸는 어린이</h4>
  </div>

  <div class="list-wrap">
    <div class="box">
      <p class="img mark"><img src="/common/images/sub_com/symbol_tyB_temp1.png" alt="교표 이미지"></p>
      <div class="inner">
        <h4>교표</h4>
        <div class="text-box">
          <p>교표에 대한 설명을 입력하세요.</p>
          <button class="btn-toggle">펼쳐보기</button>
        </div>
      </div>
    </div>
    <div class="box">
      <p class="img"><img src="/common/images/sub_com/symbol_temp3.png" alt="교화 이미지"></p>
      <div class="inner">
        <h4>교화<span>○○</span></h4>
        <div class="text-box">
          <p>교화에 대한 설명을 입력하세요.</p>
          <button class="btn-toggle">펼쳐보기</button>
        </div>
      </div>
    </div>
    <div class="box">
      <p class="img"><img src="/common/images/sub_com/symbol_temp4.png" alt="교목 이미지"></p>
      <div class="inner">
        <h4>교목<span>○○</span></h4>
        <div class="text-box">
          <p>교목에 대한 설명을 입력하세요.</p>
          <button class="btn-toggle">펼쳐보기</button>
        </div>
      </div>
    </div>
    <div class="box song-wrap">
      <div class="img">
        <h5>○○학교 교가</h5>
        <p class="rsp_img"><img src="/common/images/sub_com/symbol_song.png" alt="악보 이미지"></p>
      </div>
      <div class="song-cont">
        <h4>교가</h4>
        <div class="lyr">
          <h5>교가 1절</h5>
          <p>가사 1절 내용을 입력하세요.</p>
          <h5>교가 2절</h5>
          <p>가사 2절 내용을 입력하세요.</p>
        </div>
        <div class="btn-wrap">
          <button class="btn-st pri">교가듣기</button>
          <button class="btn-st sec">악보다운로드</button>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'symbol-tyC',
    category: '상징',
    label: '상징 tyC',
    desc: '스티키 타이틀 스크롤스파이 + 교가',
    code: `<script>
$(function () {
  const $sections = $('.box');
  const $title = $('#title');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $title.text($(entry.target).data('title'));
      }
    });
  }, {
    root: null,
    threshold: 0,
    rootMargin: '-100px 0px -100% 0px'
  });

  $sections.each(function () {
    observer.observe(this);
  });
});
<\/script>

<div class="symbol tyC">
  <div class="symbol-sticky">
    <h4 id="title">학교 교훈</h4>
  </div>

  <div class="list-wrap">
    <div class="box" data-title="학교 교훈">
      <h4>학교 교훈</h4>
      <div class="inner">
        <p class="slogan">
          <strong>○○</strong>을 즐겨하고 <strong>○○</strong>을 행동의 <strong>기준</strong>으로 삼는다.
        </p>
      </div>
    </div>
    <div class="box" data-title="학교 상징">
      <h4>학교 상징</h4>
      <div class="inner">
        <dl>
          <dt><p class="img"><img src="/common/images/sub_com/symbol_tyC_temp1.png" alt="교표 이미지"></p></dt>
          <dd>
            <h5><span>교표</span>교표</h5>
            <p>교표에 대한 설명을 입력하세요.</p>
          </dd>
        </dl>
        <dl>
          <dt><p class="img"><img src="/common/images/sub_com/symbol_temp4.png" alt="교목 이미지"></p></dt>
          <dd>
            <h5><span>교목</span>○○</h5>
            <p>교목에 대한 설명을 입력하세요.</p>
          </dd>
        </dl>
        <dl>
          <dt><p class="img"><img src="/common/images/sub_com/symbol_temp3.png" alt="교화 이미지"></p></dt>
          <dd>
            <h5><span>교화</span>○○</h5>
            <p>교화에 대한 설명을 입력하세요.</p>
          </dd>
        </dl>
      </div>
    </div>
    <div class="box song-wrap" data-title="학교 교가">
      <h4>학교 교가</h4>
      <div class="inner">
        <div class="img">
          <h5>○○학교 교가</h5>
          <p class="rsp_img"><img src="/common/images/sub_com/symbol_song.png" alt="악보 이미지"></p>
        </div>
        <div class="song-cont">
          <div class="lyr">
            <h5>교가 1절</h5>
            <p>가사 1절 내용을 입력하세요.</p>
            <h5>교가 2절</h5>
            <p>가사 2절 내용을 입력하세요.</p>
          </div>
          <div class="btn-wrap">
            <button class="btn-st pri">교가듣기</button>
            <button class="btn-st sec">악보다운로드</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
]
