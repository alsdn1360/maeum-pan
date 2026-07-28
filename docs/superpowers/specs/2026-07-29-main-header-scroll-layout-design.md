# 메인 페이지 헤더를 설교 페이지 구조로 통일

작성일: 2026-07-29

## 배경

메인 페이지와 설교 페이지의 헤더가 서로 다른 스크롤 구조 위에 놓여 있다.

| | 메인 (`app/(main)`) | 설교 (`app/sermon/[id]`) |
| --- | --- | --- |
| 스크롤 주체 | 문서(body) — `main`이 `min-h-dvh` | `main` 아래 내부 컨테이너 — `main`이 `h-dvh overflow-hidden` |
| 헤더 위치 | `sticky top-0` | `relative`, 스크롤 컨테이너 바깥 |
| 하단 구분선 | 없음 | 스크롤 시 `border-transparent` → `border-border` 전환 |

이 차이 때문에 두 가지 문제가 있다.

1. **오버스크롤 시 헤더가 밀린다.** 메인은 문서가 스크롤 주체이므로 최상단에서 위로 당기면 브라우저의 문서 레벨 러버밴딩이 일어나고, `sticky` 헤더가 문서와 함께 아래로 딸려 내려간다. 설교 페이지는 문서가 스크롤 불가라 이 현상이 없다. 저장소 어디에도 `overscroll-behavior` 선언이 없으므로 원인은 전적으로 구조 차이다.
2. **두 페이지의 헤더 마감이 다르다.** 설교 헤더에만 구분선과 전환 효과가 있다.

## 목표

- 메인 헤더가 오버스크롤 상황에서도 고정되도록 한다.
- 두 페이지가 동일한 스크롤 레이아웃과 헤더 시각 톤을 공유하게 한다.
- 메인 페이지의 현재 화면 구성(콘텐츠 세로 위치)은 픽셀 단위로 유지한다.

## 목표가 아닌 것

- 메인 헤더에 스크롤 진행 바를 추가하는 것. 메인은 콘텐츠가 뷰포트에 맞아 진행률이 항상 0이므로 의미가 없다.
- 메인 헤더에 새 액션 버튼을 추가하는 것.
- 설교 페이지의 렌더 결과 변경. 설교 페이지는 내부 배선만 바뀌고 화면은 그대로다.

## 설계

### 1. 공용 `ScrollLayout` 추출

`SermonScrollLayout`이 두 페이지에서 쓰이게 되므로 `src/components/common/scroll-layout.tsx`로 승격한다 (콜로케이션 규칙: 두 곳 이상에서 쓰일 때만 올린다).

헤더는 스크롤 컨테이너의 `ref`를 필요로 하지만, 두 페이지 모두 서버 컴포넌트라 render prop(함수)을 클라이언트 컴포넌트로 넘길 수 없다. 따라서 `ScrollLayout`이 `ref`를 **context로 내려주고**, 헤더는 `header={<MainHeader />}` 처럼 `ReactNode`로 받는다. `ReactNode`는 RSC 경계를 넘을 수 있다.

```tsx
'use client';

// src/components/common/scroll-layout.tsx
const ScrollContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export const useScrollContainer = () => {
  const context = useContext(ScrollContainerContext);

  if (!context) {
    throw new Error('useScrollContainer는 ScrollLayout 안에서만 쓸 수 있다.');
  }

  return context;
};

interface ScrollLayoutProps extends PropsWithChildren {
  header: ReactNode;
}

export function ScrollLayout({ header, children }: ScrollLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContainerContext value={scrollRef}>
      <main className="flex h-dvh w-full flex-col overflow-hidden">
        {header}

        {/* 스크롤 주체를 헤더 아래 컨테이너로 두어야 스크롤바가 헤더를 덮지 않고,
            문서가 스크롤되지 않아 오버스크롤 시 헤더가 밀리지 않는다. */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </main>
    </ScrollContainerContext>
  );
}
```

React 19이므로 `<Context.Provider>` 없이 `<Context value={...}>`를 쓴다.

`sermon-scroll-layout.tsx`는 삭제한다.

### 2. `useScrollProgress` 승격

`app/sermon/[id]/_hooks/use-scroll-progress.ts` → `src/lib/use-scroll-progress.ts`로 이동한다. **내용은 바꾸지 않는다** — `scrollRef`를 인자로 받는 순수한 형태를 유지하고, context 접근은 호출부에서 한다.

```tsx
const scrollRef = useScrollContainer();
const { isScrolled } = useScrollProgress({ scrollRef });
```

`src/hooks` 디렉터리가 없고 CLAUDE.md가 승격 대상으로 `components`/`lib`/`constants`만 명시하므로 `lib`에 둔다. CLAUDE.md도 훅과 유틸을 같은 규칙(화살표 함수 + named export)으로 묶고 있다.

### 3. `MainHeader`

`'use client'`가 되고, 설교 헤더와 동일한 클래스·전환을 갖는다. `scrollYProgress`는 쓰지 않는다.

```tsx
export function MainHeader() {
  const scrollRef = useScrollContainer();
  const { isScrolled } = useScrollProgress({ scrollRef });

  return (
    <header
      className={cn(
        'bg-background relative z-10 flex h-16 w-full shrink-0 items-center border-b p-4 transition-all duration-200 ease-in-out',
        isScrolled ? 'border-border dark:border-border/80' : 'border-transparent',
      )}>
      <SermonListSheet />
    </header>
  );
}
```

오른쪽 그룹이 없으므로 설교 헤더의 `justify-between`은 붙이지 않는다.

### 4. 메인 페이지

```tsx
export default function MainPage() {
  return (
    <ScrollLayout header={<MainHeader />}>
      <div className="flex min-h-full flex-col">
        <MainContent />
        <MainFooter />
      </div>
    </ScrollLayout>
  );
}
```

`MainContent`의 `-mt-16`은 **그대로 둔다.** 스크롤 영역 높이를 `H = dvh - 64`, 푸터 높이를 `f`라 하면 콘텐츠 박스는 `H + 64 - f` 높이로 `y = -64`에서 시작하므로, 뷰포트 기준 세로 중심은 `64 + (-64 + (H + 64 - f) / 2) = (dvh - f) / 2`가 된다. 이는 현재 구조의 중심과 정확히 같다. 즉 화면 변화가 없다.

`min-h-full`은 부모(`flex-1` 스크롤 컨테이너)가 `h-dvh` 플렉스 칼럼 안에 있어 높이가 확정되므로 정상 해석된다.

### 5. `SermonHeader` / 설교 페이지

`SermonHeader`는 `scrollRef` prop을 제거하고 `useScrollContainer()`로 얻는다. `videoId` prop은 유지한다. 나머지 마크업과 스크롤 진행 바는 그대로다.

```tsx
<ScrollLayout header={<SermonHeader videoId={id} />}>
  ...
</ScrollLayout>
```

## 영향 범위

| 파일 | 변경 |
| --- | --- |
| `src/components/common/scroll-layout.tsx` | 신규 |
| `src/lib/use-scroll-progress.ts` | 이동 (내용 동일) |
| `src/app/sermon/[id]/_components/sermon-scroll-layout.tsx` | 삭제 |
| `src/app/sermon/[id]/_hooks/use-scroll-progress.ts` | 삭제 |
| `src/app/sermon/[id]/_components/sermon-header.tsx` | prop 제거, import 경로 변경 |
| `src/app/sermon/[id]/page.tsx` | `ScrollLayout` 사용 |
| `src/app/(main)/_components/main-header.tsx` | 클라이언트 전환, 클래스 교체 |
| `src/app/(main)/page.tsx` | `ScrollLayout` 사용 |

`MainContent`, `MainFooter`, `SermonContent`, `SermonFooter`는 건드리지 않는다.

## 위험과 판단

- **모바일 주소창 자동 숨김.** `h-dvh overflow-hidden`은 문서 스크롤을 없애므로 주소창이 자동으로 숨지 않는다. 다만 메인은 현재도 콘텐츠가 뷰포트에 맞아 문서 스크롤이 발생하지 않으므로 동작 변화가 없다. 설교 페이지는 이미 같은 구조다.
- **context 도입.** 호출부가 둘뿐이라 과할 수 있으나, 서버 컴포넌트 경계 때문에 render prop을 쓸 수 없고 대안은 레이아웃 JSX 중복이다. 콜로케이션 규칙에 따라 공용화를 택한다.
- **`-mt-16`의 의미.** 값은 그대로지만 기준이 "문서 전체" → "스크롤 영역"으로 바뀐다. 계산 결과가 동일함을 위 4절에 남긴다.

## 검증

테스트 프레임워크가 없으므로 lint + 빌드 + 실제 실행으로 확인한다.

```bash
pnpm lint
pnpm --filter web build
pnpm dev
```

실행 후 확인할 것:

1. 메인 최상단에서 위로 당겨도 헤더가 움직이지 않는다. (원래 증상)
2. 메인 콘텐츠의 세로 위치가 변경 전과 같다.
3. 메인 헤더에 구분선이 보이지 않는다(스크롤이 없으므로). 창을 세로로 좁혀 콘텐츠가 넘치면 스크롤 시 구분선이 나타난다.
4. 설교 페이지의 헤더·구분선·스크롤 진행 바가 변경 전과 동일하게 동작한다.
5. 설교 페이지 스크롤바가 헤더를 덮지 않는다. (기존 수정 유지)
6. 라이트/다크 모드 모두에서 3, 4를 확인한다.
