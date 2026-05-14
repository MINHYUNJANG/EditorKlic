export default [
  {
    id: 'pri-his-list',
    category: '역대교장',
    label: '역대교장 tyA (리스트형)',
    desc: '카드 그리드 + 약력보기 팝업',
    code: `<div class="pri-his tyA list container">
  <div class="list-wrap">
    <ul>
      <li>
        <div class="inner">
          <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
          <div class="info">
            <span class="order">제 <strong>01</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term">
              <strong>재임기간</strong>
              2023.03.01. ~ 현재
            </div>
          </div>
        </div>
        <a href="" class="btn-view">약력보기</a>
      </li>
      <li>
        <div class="inner">
          <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
          <div class="info">
            <span class="order">제 <strong>02</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term">
              <strong>재임기간</strong>
              2023.03.01. ~ 현재
            </div>
          </div>
        </div>
        <a href="" class="btn-view">약력보기</a>
      </li>
      <li>
        <div class="inner">
          <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
          <div class="info">
            <span class="order">제 <strong>03</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term">
              <strong>재임기간</strong>
              2023.03.01. ~ 현재
            </div>
          </div>
        </div>
        <a href="" class="btn-view">약력보기</a>
      </li>
      <li>
        <div class="inner">
          <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
          <div class="info">
            <span class="order">제 <strong>04</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term">
              <strong>재임기간</strong>
              2023.03.01. ~ 현재
            </div>
          </div>
        </div>
        <a href="" class="btn-view">약력보기</a>
      </li>
      <li>
        <div class="inner">
          <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
          <div class="info">
            <span class="order">제 <strong>05</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term">
              <strong>재임기간</strong>
              2023.03.01. ~ 현재
            </div>
          </div>
        </div>
        <a href="" class="btn-view">약력보기</a>
      </li>
    </ul>
  </div>
</div>

<!-- 약력보기 팝업 -->
<div class="pri-his tyA popup" id="preHisPopup" role="dialog" aria-modal="true" aria-hidden="true" tabindex="-1">
  <div class="popup-wrap">
    <div class="info-wrap">
      <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
      <div class="info">
        <span class="order">제 <strong>01</strong> 대</span>
        <p><strong>홍길동</strong> 교장</p>
        <div class="term">
          <strong>재임기간</strong>
          2023.03.01. ~ 현재
        </div>
      </div>
    </div>
    <div class="list-wrap" tabindex="0">
      <h4 class="tit-st unit">학력</h4>
      <ul>
        <li><strong>1982</strong>
          <p>○○대학교 ○○학과 졸업</p>
        </li>
      </ul>
      <h4 class="tit-st unit">주요 업적</h4>
      <ul>
        <li><strong>1999</strong><p>주요 업적 내용</p></li>
        <li><strong>2000</strong><p>주요 업적 내용</p></li>
      </ul>
    </div>
    <p class="bg" aria-hidden="true"></p>
    <button class="btn-close"><span class="hid">약력보기 팝업 닫기</span><i class="ri-close-line" aria-hidden="true"></i></button>
  </div>
</div>`,
  },
  {
    id: 'pri-his-slide',
    category: '역대교장',
    label: '역대교장 tyA (슬라이드형)',
    desc: 'Swiper 슬라이드 + 약력보기 팝업',
    code: `<div class="pri-his tyA slide">
  <div class="history-header">
    <img src="/common/images/sub_com/pri_history_ico1.png" alt="" class="obj1">
    <p class="txt">학교를 빛내주신 <strong class="col">역대교장</strong>을 <strong>소개</strong>드립니다.</p>
    <img src="/common/images/sub_com/pri_history_ico2.png" alt="" class="obj2">
  </div>

  <div class="list-wrap">
    <div class="control">
      <button class="btn-prev"><span class="hid">역대교장 슬라이드 이전으로</span><i class="ri-arrow-left-s-line" aria-hidden="true"></i></button>
      <button class="btn-next"><span class="hid">역대교장 슬라이드 다음으로</span><i class="ri-arrow-right-s-line" aria-hidden="true"></i></button>
    </div>

    <div class="swiper priHisSwiper">
      <div class="swiper-wrapper">
        <div class="swiper-slide"><div class="card">
          <div class="inner">
            <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
            <div class="info">
              <span class="order">제 <strong>01</strong> 대</span>
              <p><strong>홍길동</strong> 교장</p>
              <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
            </div>
            <p class="bg" aria-hidden="true"></p>
          </div>
          <a href="" class="btn-view">약력보기</a>
        </div></div>
        <div class="swiper-slide"><div class="card">
          <div class="inner">
            <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
            <div class="info">
              <span class="order">제 <strong>02</strong> 대</span>
              <p><strong>홍길동</strong> 교장</p>
              <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
            </div>
            <p class="bg" aria-hidden="true"></p>
          </div>
          <a href="" class="btn-view">약력보기</a>
        </div></div>
        <div class="swiper-slide"><div class="card">
          <div class="inner">
            <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
            <div class="info">
              <span class="order">제 <strong>03</strong> 대</span>
              <p><strong>홍길동</strong> 교장</p>
              <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
            </div>
            <p class="bg" aria-hidden="true"></p>
          </div>
          <a href="" class="btn-view">약력보기</a>
        </div></div>
        <div class="swiper-slide"><div class="card">
          <div class="inner">
            <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
            <div class="info">
              <span class="order">제 <strong>04</strong> 대</span>
              <p><strong>홍길동</strong> 교장</p>
              <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
            </div>
            <p class="bg" aria-hidden="true"></p>
          </div>
          <a href="" class="btn-view">약력보기</a>
        </div></div>
        <div class="swiper-slide"><div class="card">
          <div class="inner">
            <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
            <div class="info">
              <span class="order">제 <strong>05</strong> 대</span>
              <p><strong>홍길동</strong> 교장</p>
              <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
            </div>
            <p class="bg" aria-hidden="true"></p>
          </div>
          <a href="" class="btn-view">약력보기</a>
        </div></div>
        <div class="swiper-slide"><div class="card">
          <div class="inner">
            <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
            <div class="info">
              <span class="order">제 <strong>06</strong> 대</span>
              <p><strong>홍길동</strong> 교장</p>
              <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
            </div>
            <p class="bg" aria-hidden="true"></p>
          </div>
          <a href="" class="btn-view">약력보기</a>
        </div></div>
      </div>
    </div>
  </div>
</div>

<!-- 약력보기 팝업 -->
<div class="pri-his tyA popup" id="preHisPopup" role="dialog" aria-modal="true" aria-hidden="true" tabindex="-1">
  <div class="popup-wrap">
    <div class="info-wrap">
      <p class="img"><img src="/common/images/sub_com/pri_history_A_temp.png" alt=""></p>
      <div class="info">
        <span class="order">제 <strong>01</strong> 대</span>
        <p><strong>홍길동</strong> 교장</p>
        <div class="term">
          <strong>재임기간</strong>
          2023.03.01. ~ 현재
        </div>
      </div>
    </div>
    <div class="list-wrap" tabindex="0">
      <h4 class="tit-st unit">학력</h4>
      <ul>
        <li><strong>1982</strong>
          <p>○○대학교 ○○학과 졸업</p>
        </li>
      </ul>
      <h4 class="tit-st unit">주요 업적</h4>
      <ul>
        <li><strong>1999</strong><p>주요 업적 내용</p></li>
        <li><strong>2000</strong><p>주요 업적 내용</p></li>
      </ul>
    </div>
    <p class="bg" aria-hidden="true"></p>
    <button class="btn-close"><span class="hid">약력보기 팝업 닫기</span><i class="ri-close-line" aria-hidden="true"></i></button>
  </div>
</div>`,
  },
  {
    id: 'pri-his-tyB',
    category: '역대교장',
    label: '역대교장 tyB',
    desc: '인라인 펼침 상세 + 사진 그리드',
    code: `<div class="pri-his tyB">
  <div class="list-wrap container">
    <ul>
      <li>
        <button class="btn-item" role="region" aria-expanded="false">
          <p class="img"><img src="/common/images/sub_com/pri_history_B_temp.png" alt=""></p>
          <div class="info">
            <span>제 01대 교장</span>
            <strong>홍길동</strong>
            <p>2023.03.01. ~ 현재</p>
          </div>
        </button>
        <div class="detail-data">
          <dl class="pri">
            <dt>제 01대 교장</dt>
            <dd><strong>홍길동</strong></dd>
            <dd>재임기간 : 2023.03.01. ~ 현재</dd>
          </dl>
          <dl class="his">
            <dt>학력</dt>
            <dd>
              <ul>
                <li>○○대학교 ○○학과 졸업</li>
                <li>○○대학원 ○○학과 졸업</li>
              </ul>
            </dd>
          </dl>
          <dl class="his">
            <dt>주요 업적</dt>
            <dd>
              <ul>
                <li>주요 업적 내용</li>
                <li>주요 업적 내용</li>
              </ul>
            </dd>
          </dl>
        </div>
      </li>
      <li>
        <button class="btn-item" role="region" aria-expanded="false">
          <p class="img"><img src="/common/images/sub_com/pri_history_B_temp.png" alt=""></p>
          <div class="info">
            <span>제 02대 교장</span>
            <strong>홍길동</strong>
            <p>2023.03.01. ~ 현재</p>
          </div>
        </button>
        <div class="detail-data">
          <dl class="pri">
            <dt>제 02대 교장</dt>
            <dd><strong>홍길동</strong></dd>
            <dd>재임기간 : 2023.03.01. ~ 현재</dd>
          </dl>
          <dl class="his">
            <dt>학력</dt>
            <dd>
              <ul>
                <li>○○대학교 ○○학과 졸업</li>
                <li>○○대학원 ○○학과 졸업</li>
              </ul>
            </dd>
          </dl>
          <dl class="his">
            <dt>주요 업적</dt>
            <dd>
              <ul>
                <li>주요 업적 내용</li>
                <li>주요 업적 내용</li>
              </ul>
            </dd>
          </dl>
        </div>
      </li>
      <li>
        <button class="btn-item" role="region" aria-expanded="false">
          <p class="img"><img src="/common/images/sub_com/pri_history_B_temp.png" alt=""></p>
          <div class="info">
            <span>제 03대 교장</span>
            <strong>홍길동</strong>
            <p>2023.03.01. ~ 현재</p>
          </div>
        </button>
        <div class="detail-data">
          <dl class="pri">
            <dt>제 03대 교장</dt>
            <dd><strong>홍길동</strong></dd>
            <dd>재임기간 : 2023.03.01. ~ 현재</dd>
          </dl>
          <dl class="his">
            <dt>학력</dt>
            <dd>
              <ul>
                <li>○○대학교 ○○학과 졸업</li>
                <li>○○대학원 ○○학과 졸업</li>
              </ul>
            </dd>
          </dl>
          <dl class="his">
            <dt>주요 업적</dt>
            <dd>
              <ul>
                <li>주요 업적 내용</li>
                <li>주요 업적 내용</li>
              </ul>
            </dd>
          </dl>
        </div>
      </li>
      <li>
        <button class="btn-item" role="region" aria-expanded="false">
          <p class="img"><img src="/common/images/sub_com/pri_history_B_temp.png" alt=""></p>
          <div class="info">
            <span>제 04대 교장</span>
            <strong>홍길동</strong>
            <p>2023.03.01. ~ 현재</p>
          </div>
        </button>
        <div class="detail-data">
          <dl class="pri">
            <dt>제 04대 교장</dt>
            <dd><strong>홍길동</strong></dd>
            <dd>재임기간 : 2023.03.01. ~ 현재</dd>
          </dl>
          <dl class="his">
            <dt>학력</dt>
            <dd>
              <ul>
                <li>○○대학교 ○○학과 졸업</li>
                <li>○○대학원 ○○학과 졸업</li>
              </ul>
            </dd>
          </dl>
          <dl class="his">
            <dt>주요 업적</dt>
            <dd>
              <ul>
                <li>주요 업적 내용</li>
                <li>주요 업적 내용</li>
              </ul>
            </dd>
          </dl>
        </div>
      </li>
    </ul>
  </div>
</div>`,
  },
  {
    id: 'pri-his-tyC',
    category: '역대교장',
    label: '역대교장 tyC',
    desc: '간단 카드형 (이미지/업적 선택)',
    code: `<div class="pri-his tyC"><!-- 이미지 있을 시 'ty-img'-->
  <div class="list-wrap">
    <ul>
      <li>
        <div class="info-wrap">
          <!-- 이미지 있을 시 -->
          <!-- <p class="img"><img src="/common/images/sub_com/pri_history_C_temp.png" alt=""></p> -->
          <div class="inr">
            <span class="order">제 <strong>01</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
          </div>
        </div>
        <!-- 이력 있을 시 -->
        <!-- <div class="his-wrap"><h5>주요업적</h5><p class="bu-st3">주요 업적 내용<br>주요 업적 내용</p></div> -->
      </li>
      <li>
        <div class="info-wrap">
          <!-- 이미지 있을 시 -->
          <!-- <p class="img"><img src="/common/images/sub_com/pri_history_C_temp.png" alt=""></p> -->
          <div class="inr">
            <span class="order">제 <strong>02</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
          </div>
        </div>
        <!-- 이력 있을 시 -->
        <!-- <div class="his-wrap"><h5>주요업적</h5><p class="bu-st3">주요 업적 내용<br>주요 업적 내용</p></div> -->
      </li>
      <li>
        <div class="info-wrap">
          <!-- 이미지 있을 시 -->
          <!-- <p class="img"><img src="/common/images/sub_com/pri_history_C_temp.png" alt=""></p> -->
          <div class="inr">
            <span class="order">제 <strong>03</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
          </div>
        </div>
        <!-- 이력 있을 시 -->
        <!-- <div class="his-wrap"><h5>주요업적</h5><p class="bu-st3">주요 업적 내용<br>주요 업적 내용</p></div> -->
      </li>
      <li>
        <div class="info-wrap">
          <!-- 이미지 있을 시 -->
          <!-- <p class="img"><img src="/common/images/sub_com/pri_history_C_temp.png" alt=""></p> -->
          <div class="inr">
            <span class="order">제 <strong>04</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
          </div>
        </div>
        <!-- 이력 있을 시 -->
        <!-- <div class="his-wrap"><h5>주요업적</h5><p class="bu-st3">주요 업적 내용<br>주요 업적 내용</p></div> -->
      </li>
      <li>
        <div class="info-wrap">
          <!-- 이미지 있을 시 -->
          <!-- <p class="img"><img src="/common/images/sub_com/pri_history_C_temp.png" alt=""></p> -->
          <div class="inr">
            <span class="order">제 <strong>05</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
          </div>
        </div>
        <!-- 이력 있을 시 -->
        <!-- <div class="his-wrap"><h5>주요업적</h5><p class="bu-st3">주요 업적 내용<br>주요 업적 내용</p></div> -->
      </li>
      <li>
        <div class="info-wrap">
          <!-- 이미지 있을 시 -->
          <!-- <p class="img"><img src="/common/images/sub_com/pri_history_C_temp.png" alt=""></p> -->
          <div class="inr">
            <span class="order">제 <strong>06</strong> 대</span>
            <p><strong>홍길동</strong> 교장</p>
            <div class="term"><strong>재임기간</strong> 2023.03.01. ~ 현재</div>
          </div>
        </div>
        <!-- 이력 있을 시 -->
        <!-- <div class="his-wrap"><h5>주요업적</h5><p class="bu-st3">주요 업적 내용<br>주요 업적 내용</p></div> -->
      </li>
    </ul>
  </div>
</div>`,
  },
]
