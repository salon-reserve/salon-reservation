const form = document.getElementById("reservation-form");
const adminList = document.getElementById("admin-booking-list");

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

if (form) {
  form.addEventListener("submit", function (e) {
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

    fetch("https://salon-reserve.github.io/salon-reservation/YOUR_EXEC_URL", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(reservation)
    })
      .then(() => {
        const reservations = getReservations();
        reservations.push(reservation);
        saveReservations(reservations);

        alert("予約を送信しました");
        form.reset();
      })
      .catch((error) => {
        console.error("送信エラー詳細:", error);
        alert("送信エラーが発生しました");
      });
  });
}

renderReservations();