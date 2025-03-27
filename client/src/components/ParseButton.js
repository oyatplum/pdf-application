import React from "react";
import styled from "styled-components";
import { Section, Title, Bar, SemiTitle, Button } from "../styles/GlobalStyle";

export default function ParseButton({ onParse }) {
  return (
    <Section>
      <Title>
        <Bar />
        <SemiTitle>신/구 구조문 추출</SemiTitle>
      </Title>
      <Button onClick={onParse}>파싱 실행</Button>
    </Section>
  );
}
