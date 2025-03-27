import React from "react";
import styled from "styled-components";

export default function FileUpload({ onChange, fileName }) {
  return (
    <Section>
      <h2>📄 파일 업로드</h2>
      <input type="file" accept="application/pdf" onChange={onChange} />
      {fileName && <p>선택한 파일: {fileName}</p>}
    </Section>
  );
}
const Section = styled.section`
  margin-bottom: 4rem;
`;
