import { createGlobalStyle, css } from "styled-components";
import styled from "styled-components";
import reset from "styled-reset";

export const Section = styled.section`
  margin-bottom: 4rem;
`;

export const Button = styled.button`
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.blue};
  color: white;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  ${({ theme }) => theme.fonts.font1_4};
  font-weight: 500;
`;
export const Title = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
`;
export const Bar = styled.div`
  background-color: ${({ theme }) => theme.colors.blue};
  width: 0.6rem;
  height: 4rem;
  margin-right: 1.3rem;
`;
export const SemiTitle = styled.div`
  color: black;
  ${({ theme }) => theme.fonts.font2_0};
  font-weight: 500;
`;

export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const GlobalStyle = createGlobalStyle`
${reset}

  :root {
    font-family: Avenir;
  }

  html,body {
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    font-size: 62.5%;
    -ms-overflow-style: none; /* 인터넷 익스플로러  스크롤바 숨김 */
    scrollbar-width: none; /* 파이어폭스 스크롤바 숨김 */
    scroll-behavior: smooth;
  }

  #root::-webkit-scrollbar {
    display: none; /* 크롬, 사파리, 오페라, 엣지 스크롤바 숨김 */
  }
`;

export default GlobalStyle;
