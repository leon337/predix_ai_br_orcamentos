(() => {
  "use strict";

  const screens = [...document.querySelectorAll(".screen")];
  const stepLabel = document.querySelector("#stepLabel");
  const stepTitle = document.querySelector("#stepTitle");
  const progressBar = document.querySelector("#progressBar");
  const progressTrack = document.querySelector(".progress-track");
  const navigation = document.querySelector("#appNavigation");
  const backButton = document.querySelector("#backButton");
  const nextButton = document.querySelector("#nextButton");
  const startButton = document.querySelector("#startButton");
  const brandLink = document.querySelector(".brand");
  const budgetCards = [...document.querySelectorAll(".budget-card")];
  const materialsButton = document.querySelector("#materialsButton");
  const materialsDialog = document.querySelector("#materialsDialog");
  const dialogCloseIcon = document.querySelector("#dialogCloseIcon");
  const dialogCloseButton = document.querySelector("#dialogCloseButton");
  const selectionStatus = document.querySelector("#selectionStatus");
  const finalBudgetTitle = document.querySelector("#finalBudgetTitle");
  const finalBudgetValue = document.querySelector("#finalBudgetValue");
  const whatsappButton = document.querySelector("#whatsappButton");

  const budgets = {
    "1": {
      title: "Orçamento 1 — materiais + mão de obra",
      value: "R$ 13.500,00",
      message:
        "Olá, Jailson! Aqui é André Luiz. Analisei e aprovei o orçamento 1, com materiais e mão de obra, e gostaria de fechar o serviço e acordar os detalhes.",
    },
    "2": {
      title: "Orçamento 2 — apenas mão de obra",
      value: "R$ 4.500,00",
      message:
        "Olá, Jailson! Aqui é André Luiz. Analisei e aprovei o orçamento 2, apenas mão de obra e materiais por minha conta, e gostaria de fechar o serviço e acordar os detalhes.",
    },
  };

  let currentStep = 0;
  let selectedBudget = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let dialogTrigger = null;

  function updateScreen({ focusHeading = false } = {}) {
    screens.forEach((screen, index) => {
      const isActive = index === currentStep;
      screen.classList.toggle("is-active", isActive);
      screen.hidden = !isActive;
      screen.setAttribute("aria-hidden", String(!isActive));
    });

    const activeScreen = screens[currentStep];
    const activeContent = activeScreen.querySelector(".screen-content");

    if (activeContent) {
      activeContent.scrollTop = 0;
    }

    stepLabel.textContent = `Etapa ${currentStep + 1} de 8`;
    stepTitle.textContent = activeScreen.dataset.title;
    progressBar.style.width = `${((currentStep + 1) / screens.length) * 100}%`;
    progressTrack.setAttribute("aria-valuenow", String(currentStep + 1));

    navigation.hidden = currentStep === 0;
    navigation.classList.toggle("final-navigation", currentStep === 7);
    backButton.disabled = currentStep === 0;

    if (currentStep === 6) {
      nextButton.querySelector("span").textContent = "Continuar para aprovação";
      nextButton.disabled = selectedBudget === null;
    } else {
      nextButton.querySelector("span").textContent = "Próximo";
      nextButton.disabled = false;
    }

    history.replaceState(null, "", `#etapa-${currentStep + 1}`);

    if (focusHeading) {
      const heading = activeScreen.querySelector("h1, h2");
      requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
    }
  }

  function goToStep(target, options = {}) {
    const nextStep = Math.max(0, Math.min(screens.length - 1, target));

    if (currentStep === 6 && nextStep > 6 && !selectedBudget) {
      selectionStatus.textContent = "Escolha um orçamento para continuar.";
      nextButton.disabled = true;
      return;
    }

    if (nextStep === currentStep) {
      return;
    }

    currentStep = nextStep;
    updateScreen(options);
  }

  function selectBudget(value) {
    if (!budgets[value]) {
      return;
    }

    selectedBudget = value;

    budgetCards.forEach((card) => {
      const isSelected = card.dataset.budget === value;
      card.setAttribute("aria-pressed", String(isSelected));
    });

    const budget = budgets[value];
    selectionStatus.textContent = `Selecionado: ${budget.title}.`;
    materialsButton.hidden = value !== "2";
    nextButton.disabled = false;
    finalBudgetTitle.textContent = budget.title;
    finalBudgetValue.textContent = budget.value;
    whatsappButton.href =
      "https://wa.me/5581986658891?text=" + encodeURIComponent(budget.message);
    whatsappButton.setAttribute("aria-disabled", "false");
  }

  function openMaterials() {
    if (selectedBudget !== "2") {
      return;
    }

    dialogTrigger = document.activeElement;
    materialsDialog.showModal();
    dialogCloseIcon.focus();
  }

  function closeMaterials() {
    if (materialsDialog.open) {
      materialsDialog.close();
    }
  }

  function returnDialogFocus() {
    if (dialogTrigger instanceof HTMLElement) {
      dialogTrigger.focus();
    }
    dialogTrigger = null;
  }

  startButton.addEventListener("click", () => goToStep(1, { focusHeading: true }));
  backButton.addEventListener("click", () => goToStep(currentStep - 1, { focusHeading: true }));
  nextButton.addEventListener("click", () => goToStep(currentStep + 1, { focusHeading: true }));

  brandLink.addEventListener("click", (event) => {
    event.preventDefault();
    goToStep(0, { focusHeading: true });
  });

  budgetCards.forEach((card) => {
    card.addEventListener("click", () => selectBudget(card.dataset.budget));
  });

  materialsButton.addEventListener("click", openMaterials);
  dialogCloseIcon.addEventListener("click", closeMaterials);
  dialogCloseButton.addEventListener("click", closeMaterials);
  materialsDialog.addEventListener("close", returnDialogFocus);

  whatsappButton.addEventListener("click", (event) => {
    if (!selectedBudget) {
      event.preventDefault();
    }
  });

  document.querySelector("#screens").addEventListener(
    "touchstart",
    (event) => {
      if (materialsDialog.open) {
        return;
      }

      const touch = event.changedTouches[0];
      touchStartX = touch.screenX;
      touchStartY = touch.screenY;
    },
    { passive: true },
  );

  document.querySelector("#screens").addEventListener(
    "touchend",
    (event) => {
      if (materialsDialog.open) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.screenX - touchStartX;
      const deltaY = touch.screenY - touchStartY;

      if (Math.abs(deltaX) < 80 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) {
        return;
      }

      goToStep(currentStep + (deltaX < 0 ? 1 : -1), { focusHeading: true });
    },
    { passive: true },
  );

  document.addEventListener("keydown", (event) => {
    if (materialsDialog.open || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const activeTag = document.activeElement?.tagName;
    if (activeTag === "BUTTON" || activeTag === "A") {
      return;
    }

    if (event.key === "ArrowRight") {
      goToStep(currentStep + 1, { focusHeading: true });
    }

    if (event.key === "ArrowLeft") {
      goToStep(currentStep - 1, { focusHeading: true });
    }
  });

  const hashStep = Number.parseInt(location.hash.replace("#etapa-", ""), 10);
  if (Number.isInteger(hashStep) && hashStep >= 1 && hashStep <= 7) {
    currentStep = hashStep - 1;
  }

  updateScreen();
})();
