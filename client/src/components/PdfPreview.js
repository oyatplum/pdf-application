import React from "react";
import styled from "styled-components";

export default function PdfPreview({ onPreview }) {
  return (
    <Section>
      <h2>👀 PDF 미리보기</h2>
      <Button onClick={onPreview}>미리보기 보기</Button>
    </Section>
  );
}
const Section = styled.section`
  margin-bottom: 4rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background-color: gray;
  color: white;
  border-radius: 0.5rem;
`;
