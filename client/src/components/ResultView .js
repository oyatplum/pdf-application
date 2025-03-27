import { Section, Title, Bar, SemiTitle } from "../styles/GlobalStyle";
import styled from "styled-components";

export default function ResultView() {
  return (
    <Section>
      <Title>
        <Bar />
        <SemiTitle>추출 결과</SemiTitle>
      </Title>
      <ResultBox></ResultBox>
    </Section>
  );
}
const ResultBox = styled.pre`
  background: ${({ theme }) => theme.colors.blue};
  padding: 1.5rem;
`;
