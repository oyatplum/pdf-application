import React from "react";
import { Section, Title, Bar, SemiTitle, Button } from "../styles/GlobalStyle";

export default function ParseButton({ file, onParse }) {
  const requestParse = async () => {
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("http://localhost:8080/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ HTML이 반환됨:", text); // HTML 오류 페이지 확인
        return;
      }

      const result = await response.json();

      const leftArray = result.map((item) => item.left).flat();
      const rightArray = result.map((item) => item.right).flat();

      const formattedResult = [leftArray, rightArray];

      console.log("파싱 결과 (처리된 형태):", formattedResult);
      onParse(formattedResult);
    } catch (error) {
      console.error("PDF 파싱 오류:", error);
    }
  };
  return (
    <Section>
      <Title>
        <Bar />
        <SemiTitle>신/구 구조문 추출</SemiTitle>
      </Title>
      <Button onClick={requestParse}>파싱 실행</Button>
    </Section>
  );
}
