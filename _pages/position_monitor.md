---
layout: default
title: position monitor
permalink: /position_monitor/
nav: false
---

<div class="post">

<div class="chart-container">
  <img id="chart-image" src="https://raw.githubusercontent.com/wavey0x/open-data/master/charts/resupply_positions.png" alt="Resupply Positions Chart">
</div>

<ul class="monitor-info">
  <li><a href="https://etherscan.io/address/0xe5BcBdf9452af0AB4b042D9d8a3c1E527E26419f" target="_blank" rel="noopener">0xe5BcBdf9452af0AB4b042D9d8a3c1E527E26419f</a></li>
  <li><a href="https://github.com/wavey0x/open-data-scripts/blob/master/scripts/resupply/position_monitor.py" target="_blank" rel="noopener">see code</a></li>
  <li id="meta-info">Loading...</li>
</ul>

</div>

<style>
.monitor-info {
  padding: 1rem 0 0 1.5rem;
  margin: 0;
}

.monitor-info li {
  font-size: 0.95rem;
  color: var(--global-text-color-light);
  line-height: 1.8;
}

.monitor-info a {
  color: var(--global-theme-color);
  text-decoration: none;
}

.monitor-info a:hover {
  text-decoration: underline;
}

.chart-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.chart-container img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--global-divider-color);
}

</style>

<script>
(async function() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/wavey0x/open-data/master/charts/resupply_positions_meta.json');
    const meta = await response.json();

    const lastRefresh = new Date(meta.last_refresh);
    const formattedDate = lastRefresh.toLocaleString();

    document.getElementById('meta-info').textContent = `Last refresh: ${formattedDate}`;

    // Add cache busting to the image
    const img = document.getElementById('chart-image');
    img.src = img.src + '?t=' + new Date(meta.last_refresh).getTime();
  } catch (err) {
    document.getElementById('meta-info').textContent = 'Failed to load metadata';
    console.error(err);
  }
})();
</script>
