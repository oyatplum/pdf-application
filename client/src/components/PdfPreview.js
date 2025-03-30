import { useEffect, useRef, useCallback, useState } from "react";
import { Section, Title, Bar, SemiTitle, Button } from "../styles/GlobalStyle";
import * as pdfjsLib from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.entry";
import styled from "styled-components";
import { flexCenter } from "../styles/GlobalStyle";

export default function PdfPreview({ onPreview, file, showPdf, onClose }) {
  const canvasRef = useRef();
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

  const [pdfRef, setPdfRef] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const renderPage = useCallback(
    (pageNum) => {
      if (!pdfRef) return;

      pdfRef.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext("2d");

        page.render({
          canvasContext: context,
          viewport,
        });
      });
    },
    [pdfRef]
  );

  useEffect(() => {
    if (pdfRef) {
      renderPage(currentPage);
    }
  }, [pdfRef, currentPage, renderPage]);

  useEffect(() => {
    if (file && showPdf) {
      const reader = new FileReader();
      reader.onload = function () {
        const arr = new Uint8Array(this.result);

        pdfjsLib.getDocument(arr).promise.then((loadedPdf) => {
          setPdfRef(loadedPdf);
          setCurrentPage(1);
        });
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file, showPdf]);

  const nextPage = () => {
    if (pdfRef && currentPage < pdfRef.numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const prevPage = () => {
    if (pdfRef && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Section>
      <Title>
        <Bar />
        <SemiTitle>PDF 미리보기</SemiTitle>
      </Title>
      <Button onClick={onPreview}>미리보기</Button>
      {showPdf && (
        <ModalLayout>
          <ModalContent>
            <canvas ref={canvasRef} />
          </ModalContent>
          <ContentWrapper>
            <Button onClick={prevPage}>⬅ 이전</Button>
            {currentPage}
            <Button onClick={nextPage}>다음 ➡</Button>
            <Button onClick={onClose}>닫기</Button>
          </ContentWrapper>
        </ModalLayout>
      )}
    </Section>
  );
}
const ModalLayout = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  ${flexCenter};
`;
const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 2rem;
  border-radius: 1rem;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  scrollbar-width: none;
  margin-right: 2rem;
`;
const ContentWrapper = styled.div`
  ${flexCenter};
  gap: 1.2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.font2_0};
`;
