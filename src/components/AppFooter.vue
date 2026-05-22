<script setup>
</script>

<template>
  <footer class="bdi-footer">
    <p class="bdi-footer-body">
      Our insurance is underwritten by Auto &amp; General Insurance (Singapore) Pte. Limited
      (Co. Reg. No. 201626103G), trading as
      <strong>Budget Direct Insurance.</strong>
    </p>
    <nav class="bdi-footer-links">
      <a href="#">Contact Us</a>
      <a href="#">Terms &amp; Conditions</a>
      <a href="#">Security &amp; Privacy</a>
    </nav>
  </footer>
</template>

<style scoped>
.bdi-footer {
  background: #fff;
  padding: 16px;
  border-top: 1px solid var(--bdi-grey-200);
}

.bdi-footer-body {
  margin: 0 0 16px 0;
  color: var(--bdi-grey-600);
  font-size: 12px;
  line-height: 1.5;
}

.bdi-footer-body strong { color: var(--bdi-grey-600); font-weight: 700; }

.bdi-footer-links {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
.bdi-footer-links a {
  color: var(--bdi-cyan);
  text-decoration: none;
  white-space: nowrap;
}
</style>
