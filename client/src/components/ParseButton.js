import React from "react";
import styled from "styled-components";

export default function ParseButton({ onParse }) {
  return (
    <Section>
      <h2>🧠 신/구 구조문 추출</h2>
      <Button onClick={onParse}>파싱 실행</Button>
    </Section>
  );
}
const Section = styled.section`
  margin-bottom: 4rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.purple_100};
  color: white;
  border-radius: 0.5rem;
`;
