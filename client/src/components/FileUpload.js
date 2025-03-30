import styled from "styled-components";
import { Section, Title, Bar, SemiTitle } from "../styles/GlobalStyle";

export default function FileUpload({ onChange, fileName }) {
  return (
    <Section>
      <Title>
        <Bar />
        <SemiTitle>파일 업로드</SemiTitle>
      </Title>
      <HiddenInput
        type="file"
        id="file"
        accept="application/pdf"
        onChange={onChange}
      />
      <Label htmlFor="file">파일 선택</Label>
      <FileName>{fileName || "선택된 파일 없음"}</FileName>
    </Section>
  );
}
const HiddenInput = styled.input`
  display: none;
`;
const Label = styled.label`
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.blue};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  ${({ theme }) => theme.fonts.font1_4};
  font-weight: 500;
`;

const FileName = styled.span`
  margin-left: 1.2rem;
  ${({ theme }) => theme.fonts.font1_4};
`;
