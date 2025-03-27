import React, { useEffect, useState } from "react";
import styled from "styled-components";
import GlobalStyle from "./styles/GlobalStyle";
import { ThemeProvider } from "styled-components";
import theme from "./styles/theme";
import FileUpload from "./components/FileUpload";
import ParseButton from "./components/ParseButton";
import PdfPreview from "./components/PdfPreview";
import ResultView from "./components/ResultView ";

const steps = ["파일 업로드", "PDF 미리보기", "신/구조문 파싱", "결과 보기"];

function App() {
  // useEffect(() => {
  //   fetch("/api")
  //     .then((res) => res.json())
  //     .then((data) => console.log(data))
  //     .catch((err) => console.error("Error:", err));
  // }, []);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setCurrentStep(1);
    }
  };

  const handlePreview = () => {
    setCurrentStep(2);
  };

  const handleParse = () => {
    setCurrentStep(3);
  };

  return (
    <Wrapper>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ProcessBar>
          {steps.map((step, idx) => (
            <Step key={idx} active={idx <= currentStep}>
              <StepCircle active={idx <= currentStep}>{idx + 1}</StepCircle>
              <StepName>{step}</StepName>
            </Step>
          ))}
          <ProgressLine width={(currentStep / (steps.length - 1)) * 100} />
        </ProcessBar>
        <Content>
          {currentStep >= 0 && (
            <FileUpload onChange={handleFileChange} fileName={fileName} />
          )}

          {currentStep >= 1 && <PdfPreview onPreview={handlePreview} />}

          {currentStep >= 2 && <ParseButton onParse={handleParse} />}

          {currentStep >= 3 && <ResultView />}
        </Content>
      </ThemeProvider>
    </Wrapper>
  );
}

export default App;

const Wrapper = styled.div`
  width: 100%;
`;
const ProcessBar = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  background: white;
  padding: 1.6rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;
const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ active, theme }) =>
    active ? theme.colors.blue : theme.colors.gray};
`;
const StepCircle = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: ${({ active, theme }) =>
    active ? theme.colors.blue : theme.colors.gray};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-bottom: 1rem;
`;
const StepName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
`;
const ProgressLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 0.4rem;
  width: ${({ width }) => width}%;
  background: ${({ theme }) => theme.colors.blue};
  transition: width 0.4s ease;
`;
const Content = styled.div`
  margin: 10rem auto 0;
  width: 120rem; // ✅ 원하는 가로폭
`;
