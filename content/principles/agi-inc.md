# AGI Inc.

I was a founding researcher at [AGI Inc](https://www.theagi.company) from March to December 2025. Two things came out of it that I am proud of.

### AGI-0: #1 on OSWorld

OSWorld is the benchmark for computer-use agents on real desktops. In October 2025 [we beat it](https://www.theagi.company/blog/osworld): AGI-0 reached **76.26%** task success across 369 real-world tasks, the top computer-use agent at the time.

AGI-0 is an end-to-end trained computer-use policy. It acts directly on real VMs (Ubuntu, Windows, macOS) with low-level control only: clicks, typing, and hotkeys. Pixels in, actions out, no API shortcuts.

We trained it with GRPO in an online RL loop. Run the policy on real machines, score by execution with verifiers, update, repeat. The task pool was hundreds of thousands of synthetic and OSWorld tasks plus our internal REAL browser environments. The agent also self-verifies: it checks each outcome and, when a step fails, corrects on the next turn.

Built by Diego Caples, Atharva Gundawar, Prannay Hebbar, Greg Tarr, and Joseph Junzhe Zhu.

[Read the full write-up &rarr;](https://www.theagi.company/blog/osworld)

### REAL: the environment underneath it

Before the agent, the environment. [REAL](https://arxiv.org/abs/2504.11543) (NeurIPS 2025) is a set of deterministic, high-fidelity replicas of 11 real websites with 112 benchmark tasks. Deterministic matters: the same action gets the same result every time, so you grade by execution instead of by rubric, and you can train on it, not just test on it. When we published, frontier models topped out around 41%.

The same stack shipped as [agisdk](https://github.com/agi-inc/agisdk): the web agent, the harness, sandbox-site access, and the benchmarking, in one Python package. 17k downloads.
