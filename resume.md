%-------------------------
% Resume in Latex
% Author :  Prannay Hebbar (https://github.com/Pran-Ker)
% License : MIT
%------------------------

\documentclass[letterpaper,11pt]{article}
\usepackage[T1]{fontenc}
\fontfamily{Georgia}\selectfont
\fontseries{m}\selectfont
\usepackage{latexsym}
\usepackage{microtype}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue, citecolor=blue]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\renewcommand{\bfseries}{\fontseries{b}\selectfont}

\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.55in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
    \vspace{-4pt}\raggedright\small\bfseries
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

%-------------------------
% Custom commands

\newcommand{\resumeItem}[1]{
    \item\small{
            {#1 \vspace{-2pt}}
    }
}

\newcommand{\resumeSubheading}[4]{
    \vspace{-2pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \normalsize\textbf{#1} & #2 \\
        \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
        \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
        \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\scriptsize$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=.4in, labelsep=.13in]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\begin{document}

%----------HEADING----------
\begin{center}
{\LARGE \scshape \bfseries Prannay Hebbar} \\ \vspace{1pt}
308 Capp St, San Francisco, CA 94110 \\ \vspace{1pt}
\small +1 209-630-9035 $|$ \href{mailto:hebbarpran@gmail.com}{\underline{hebbarpran@gmail.com}} $|$
\href{https://www.linkedin.com/in/prannay}{\underline{linkedin.com/in/prannay}} $|$
\href{https://x.com/Pran_Ker/}{\underline{x.com/Pran-Ker}} $|$
\href{https://github.com/Pran-Ker}{\underline{github.com/Pran-Ker}}
\end{center}

%----------PROFESSIONAL SUMMARY----------
\section*{INTRODUCTION}
\begin{itemize}[leftmargin=.4in, labelsep=.13in]
    {AI researcher in AGI Inc; studied at Stanford under Prof. \href{https://stanford.edu/~boyd/}{Stephen Boyd} on defining Convex constraints on RL problems. Building AI systems, and training RL on games or simulations interests me.}
\end{itemize}
\vspace{-5pt}

%-----------EXPERIENCE-----------
\section{EXPERIENCE}
\resumeSubHeadingListStart
\resumeSubheading
{AGI Inc.}{San Francisco, CA}
{AI Researcher}{Mar. 2025 -- Present}
\resumeItemListStart

\resumeItem{Published a paper on REAL: Sandbox Websites Agent Benchmarking: \href{https://arxiv.org/abs/2504.11543}{link}, which we used to close a contract with Amazon Nova team for \$500 K}
\resumeItem{Created and maintained \href{https://github.com/agi-inc/agisdk}{agisdk}, which provides a web agent and harness, access into sandbox websites, and benchmarking. All major models and frameworks have been benchmarked. So far, the python package has gotten 12k downloads.}
\resumeItem{In order to improve Web Agents, we used Policy distillation from Gemini trajectories into Deepseek. Implemented VerL and GRPO and improved web agents reliability to 76\%. }
\resumeItem{ Implemented Torch profiling on the company NVIDIA H200 GPU cluster and logging on Weights and Biases.}
\resumeItem{Created a dashboard for evaluations of the Reinforcement Learning training on \href{https://evals.agi.tech/sessions}{Evals}.}
\resumeItemListEnd

\resumeSubheading
{Aethereus (acq. Myridius )}{Dallas, TX}
{System Analyst}{Jan. 2023 -- Mar. 2025}
\resumeItemListStart
  \resumeItem{\textbf{Bread Financials (Aug 2023 -- Nov 2024):}}
    \resumeItemListStart
      \resumeItem{Collaborated with the Bread Financial Product Owner (linkedin recommendation) to implement the Comenity Bank Cardholder Portal across 46+ partner brands, delivering a scalable JavaScript/Salesforce architecture.}
      \resumeItem{Digitized the partner-brand onboarding workflow by replacing Excel hand-offs with a SheetJS-driven web app and REST hooks, cutting integration cycle time by 10–15 days.}
      \resumeItem{Launched an omni-channel customer chat portal; integrated Vibes SMS APIs and GPT-4o summarization micro-service that now handles about 1.4 k messages / week with $<$100 ms median latency.}
      \resumeItem{Directed the migration of nine critical APIs from MuleSoft to Azure, using Postman contract tests and declarative IaC pipelines to reduce defects by at least 20\%.}
      \resumeItem{Built add-on flows in JavaScript + Salesforce; introduced rule-based agent from Agentforce for automatic bundling, shrinking deal setup from 1–2 days to under 15 minutes.}
    \resumeItemListEnd

  \resumeItem{\textbf{California Lawyers for the Arts:} Automated data interchange between two SaaS platforms with custom JS webhooks and Make, now powering 8–10 critical Webflows in production.}

  \resumeItem{\textbf{YellowPad AI:} Closed the customer; RAG pipeline that turns legal contracts into interactive checklists (GPT-3 + AG Grid), achieving 95\% clause recall in internal evaluations.}
\resumeItemListEnd
\resumeSubHeadingListEnd

%-----------EDUCATION-----------
\section{EDUCATION}
\resumeSubHeadingListStart
\resumeSubheading
{Stanford University}{Stanford, CA}
{\parbox[t]{0.65\textwidth}{%
Semester (visiting student)\\
Courses: HPC, Convex Optimization-1, Principles of Robotics, AI: Principles and Technique, Investment Science; GPA: 3.775/4}}{Jun.~2024 -- Sep.~2024}
\resumeSubheading
{VIT University}{}
{B.Tech., Computer Science and Business Systems; GPA: 3.26/4, Ranking: 12/186}{Jul. 2019 -- Apr. 2023}
\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\section{PROJECTS}
\resumeSubHeadingListStart

\resumeProjectHeading
{\textbf{Claude-Web: }{Allows Claude code to act as a web agent.} \href{https://github.com/agi-inc/claude-web}{Link}}{}
\resumeItemListStart
\resumeItemListEnd

\resumeProjectHeading
{\textbf{Mac Control: }{This won a hackathon; used MCPs to control actions on the Mac.} \href{https://www.youtube.com/watch?v=p7yRFMXxhgA}{Link}}{}
\resumeItemListStart
\resumeItemListEnd

\resumeSubHeadingListEnd
%-----------Internships-----------
\section{INTERNSHIPS}
\resumeSubHeadingListStart
\resumeSubheading
{OnTribe}{Mar. 2020 -- Feb. 2021}
{}{}{Developed ML models that automatically score job applicants by extracting and analyzing profile signals from LinkedIn, GitHub, and X (Twitter); built Selenium-based web-scrapers to ingest data, enabling recruiters to triage 5 K+ candidates / week and cut manual review time by 30\%.}

\resumeSubheading
{Camcann Smart System}{Dec. 2019 -- Mar. 2020}
{}{}{Designed and deployed lightweight computer-vision models on Raspberry Pi devices to generate real-time virtual-try-on clothing filters for shoppers, enabling on-device inference under 100 ms}

\resumeSubHeadingListEnd
%-----------SELECTED SKILLS-----------

\section{SELECTED SKILLS}
\resumeSubHeadingListStart
\resumeProjectHeading
{\textbf{Programming Languages:}}{Python, C++, Javascript, Git, Java, Bash}
\resumeItemListStart
\resumeItemListEnd
\resumeProjectHeading
{\textbf{Frameworks:}}{PyTorch, Ray, Docker, LangGraph, ReactJs, NodeJs, WandB}
\resumeItemListStart
\resumeItemListEnd
\resumeItemListEnd
\resumeSubHeadingListEnd

\end{document}
