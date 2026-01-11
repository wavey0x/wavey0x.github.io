---
layout: default
title: position monitor
permalink: /position_monitor/
nav: false
---

<div class="post">

<div class="monitor-header">
  <h1>position monitor</h1>
  <p id="meta-info">Loading...</p>
</div>

<div class="chart-container">
  <img id="chart-image" src="https://raw.githubusercontent.com/wavey0x/open-data/master/charts/resupply_positions.png" alt="Resupply Positions Chart">
</div>

</div>

<style>
.monitor-header {
  text-align: center;
  padding: 0.125rem 0 1.5rem 0;
}

.monitor-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--global-theme-color);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.monitor-header p {
  font-size: 0.95rem;
  color: var(--global-text-color-light);
  margin: 0;
  line-height: 1.5;
}

.monitor-header a {
  color: var(--global-theme-color);
  text-decoration: none;
}

.monitor-header a:hover {
  text-decoration: underline;
}

.chart-container {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.chart-container img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--global-divider-color);
}

@media (max-width: 500px) {
  .monitor-header h1 {
    font-size: 2rem;
  }
}
</style>

<script>
(async function() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/wavey0x/open-data/master/charts/resupply_positions_meta.json');
    const meta = await response.json();

    const lastRefresh = new Date(meta.last_refresh);
    const formattedDate = lastRefresh.toLocaleString();

    let infoText = `Last refresh: ${formattedDate}`;

    if (meta.user_address) {
      const shortAddr = meta.user_address.slice(0, 6) + '...' + meta.user_address.slice(-4);
      infoText += ` | User: <a href="https://etherscan.io/address/${meta.user_address}" target="_blank" rel="noopener">${shortAddr}</a>`;
    }

    document.getElementById('meta-info').innerHTML = infoText;

    // Add cache busting to the image
    const img = document.getElementById('chart-image');
    img.src = img.src + '?t=' + new Date(meta.last_refresh).getTime();
  } catch (err) {
    document.getElementById('meta-info').textContent = 'Failed to load metadata';
    console.error(err);
  }
})();
</script>
