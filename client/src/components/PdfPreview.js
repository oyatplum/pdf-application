import { Section, Title, Bar, SemiTitle, Button } from "../styles/GlobalStyle";

export default function PdfPreview({ onPreview }) {
  return (
    <Section>
      <Title>
        <Bar />
        <SemiTitle>PDF 미리보기</SemiTitle>
      </Title>
      <Button onClick={onPreview}>미리보기 보기</Button>
    </Section>
  );
}
