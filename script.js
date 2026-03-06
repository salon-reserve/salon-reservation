const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzH9wcYB63yinLLf7KHUvOU4910XkC29__e11qv6T_rM7bZFEF3iBtu8d0BQX4f_48q_A/exec";

const form = document.getElementById("reservation-form");
const adminList = document.getElementById("admin-booking-list");
const dateInput = document.getElementById("date");
const stylistSelect = document.getElementById("stylist");
const timeSlotsBox = document.getElementById("time-slots");
const timeMessage = document.getElementById("time-message");
const timeInput = document.getElementById("time");

function getReservations() {
  const data = localStorage.getItem("reservations");
  return data ? JSON.parse(data) : [];
}

function saveReservations(reservations) {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

function renderReservations() {
  if (!adminList) return;

  const reservations = getReservations();

  if (reservations.length === 0) {
    adminList.innerHTML = "<li>まだ予約はありません</li>";
    return;
  }

  adminList.innerHTML = "";

  reservations.forEach((reservation) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${reservation.name}</strong><br>
      電話番号: ${reservation.phone}<br>
      メール: ${reservation.email || "-"}<br>
      メニュー: ${reservation.menu}<br>
      日付: ${reservation.date}<br>
      時間: ${reservation.time}<br>
      スタイリスト: ${reservation.stylist}<br>
      備考: ${reservation.message || "-"}
    `;
    li.style.listStyle = "none";
    li.style.textAlign = "left";
    li.style.padding = "16px";
    li.style.marginBottom = "12px";
    li.style.border = "1px solid #eee";
    li.style.borderRadius = "12px";
    li.style.background = "#fff";
    adminList.appendChild(li);
  });
}

function checkPassword() {
  const passwordInput = document.getElementById("admin-password");
  if (!passwordInput) return;

  const password = passwordInput.value;
  const correctPassword = "salon123";

  if (password === correctPassword) {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("admin-content").style.display = "block";
    renderReservations();
  } else {
    alert("パスワードが違います");
  }
}

async function loadAvailableTimes() {
  if (!dateInput || !stylistSelect || !timeSlotsBox || !timeMessage || !timeInput) return;

  const date = dateInput.value;
  const stylist = stylistSelect.value;

  timeInput.value = "";
  timeSlotsBox.innerHTML = "";

  if (!date || !stylist) {
    timeMessage.textContent = "日付とスタイリストを選ぶと空き時間が表示されます";
    return;
  }

  timeMessage.textContent = "空き時間を読み込み中...";

  try {
    const url = `${WEB_APP_URL}?mode=availability&date=${encodeURIComponent(date)}&stylist=${encodeURIComponent(stylist)}`;

    const response = await fetch(url);
    const result = await response.json();

    if (!result.ok) {
      timeMessage.textContent = result.message || "空き時間を取得できませんでした";
      return;
    }

    if (result.closed) {
      timeMessage.textContent = "この日は受付できません";
      return;
    }

    if (!result.times || result.times.length === 0) {
      timeMessage.textContent = "空いている時間がありません";
      return;
    }

    timeMessage.textContent = "空いている時間を選んでください";

    result.times.forEach((time) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "time-slot-btn";
      button.textContent = time;

      button.addEventListener("click", () => {
        document.querySelectorAll(".time-slot-btn").forEach((btn) => {
          btn.classList.remove("active");
        });
        button.classList.add("active");
        timeInput.value = time;
      });

      timeSlotsBox.appendChild(button);
    });
  } catch (error) {
    console.error(error);
    timeMessage.textContent = "空き時間の取得に失敗しました";
  }
}

if (dateInput) {
  dateInput.addEventListener("change", loadAvailableTimes);
}

if (stylistSelect) {
  stylistSelect.addEventListener("change", loadAvailableTimes);
}

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const reservation = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      menu: document.getElementById("menu").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      stylist: document.getElementById("stylist").value,
      message: document.getElementById("message").value
    };

    if (!reservation.time) {
      alert("時間を選んでください");
      return;
    }

    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(reservation)
      });

      const result = await response.json();

      if (result.status === "duplicate") {
        alert("その日時はすでに予約済みです。別の時間を選んでください。");
        await loadAvailableTimes();
        return;
      }

      if (result.status === "blocked") {
        alert("その日時は受付できません。別の時間を選んでください。");
        await loadAvailableTimes();
        return;
      }

      if (result.status === "success") {
        const reservations = getReservations();
        reservations.push(reservation);
        saveReservations(reservations);

        alert("予約を送信しました。確認メールをご確認ください。");
        form.reset();
        timeSlotsBox.innerHTML = "";
        timeMessage.textContent = "日付とスタイリストを選ぶと空き時間が表示されます";
        return;
      }

      alert("送信に失敗しました");
    } catch (error) {
      console.error(error);
      alert("送信エラーが発生しました");
    }
  });
}

renderReservations();