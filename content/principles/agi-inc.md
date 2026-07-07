# AGI Inc.

At [AGI Inc](https://www.theagi.company/blog/osworld) we beat OSWorld, the benchmark for computer-use agents on real desktops: **#1 in CUA**. AGI-0 reached **76.26%** task success across 369 real-world tasks (October 2025).

### How we built it

AGI-0 is an end-to-end trained computer-use policy that acts directly on real VMs (Ubuntu, Windows, macOS) with low-level control only: clicks, typing, and hotkeys, pixels in and actions out, no API shortcuts. We trained it with GRPO in an online RL loop: run the policy on real machines, score by execution with verifiers, update, and repeat, across hundreds of thousands of synthetic and OSWorld tasks plus our internal REAL browser environments. The agent also self-verifies, checking each outcome and correcting on the next turn when a step fails.

Built by Diego Caples, Atharva Gundawar, Prannay Hebbar, Greg Tarr, and Joseph Junzhe Zhu.

[Read the full write-up &rarr;](https://www.theagi.company/blog/osworld)
