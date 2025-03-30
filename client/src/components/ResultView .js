import { Section, Title, Bar, SemiTitle } from "../styles/GlobalStyle";
import styled from "styled-components";

export default function ResultView({ result }) {
  return (
    <Section>
      <Title>
        <Bar />
        <SemiTitle>추출 결과</SemiTitle>
      </Title>
      <ResultBox>{result && JSON.stringify(result, null, 2)}</ResultBox>
    </Section>
  );
}
const ResultBox = styled.pre`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.black};
  ${({ theme }) => theme.fonts.font1_4};
  line-height: 1.6;
  overflow: auto;
  border-radius: 0.5rem;
  border: 3px solid ${({ theme }) => theme.colors.blue};
  scrollbar-width: none;
`;
