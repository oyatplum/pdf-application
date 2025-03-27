import React from "react";
import styled from "styled-components";

export default function ResultView() {
  return (
    <Section>
      <h2>🧾 추출 결과</h2>
      <ResultBox></ResultBox>
    </Section>
  );
}
const Section = styled.section`
  margin-bottom: 4rem;
`;

const ResultBox = styled.pre`
  background: gray;
  padding: 1.5rem;
`;
