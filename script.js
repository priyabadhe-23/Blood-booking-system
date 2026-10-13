const tests = [
  {name:"Complete Blood Count (CBC)",price:350,desc:"A common test to check blood cells.",icon:"🩸"},
  {name:"Blood Sugar (Fasting)",price:120,desc:"Measures blood glucose after fasting.",icon:"🧪"},
  {name:"Thyroid Profile (T3, T4, TSH)",price:500,desc:"Checks levels related to thyroid function.",icon:"🦋"},
  {name:"Lipid Profile",price:450,desc:"Measures cholesterol and triglycerides.",icon:"💧"},
  {name:"Liver Function Test",price:600,desc:"Measures selected liver-related markers.",icon:"🧬"},
  {name:"Kidney Function Test",price:550,desc:"Checks selected kidney-related markers.",icon:"🔬"},
  {name:"Vitamin D",price:700,desc:"Measures vitamin D level in blood.",icon:"☀️"},
  {name:"HbA1c",price:400,desc:"Reflects average blood glucose over time.",icon:"📋"}
];
const $ = id => document.getElementById(id);
const KEY = "lifelineLabDemoBookings";
const getBookings = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const saveBookings = data => localStorage.setItem(KEY, JSON.stringify(data));
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const money = value => "₹" + Number(value).toLocaleString("en-IN");
function renderTests(filter="") {
  const filtered = tests.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
  $("testGrid").innerHTML = filtered.length ? filtered.map(t => `<article class="test-card"><div class="test-icon">${t.icon}</div><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="test-bottom"><span class="price">${money(t.price)}</span><button class="small-btn" data-book="${esc(t.name)}">Book now +</button></div></article>`).join("") : '<div class="empty">No tests match your search.</div>';
}
function renderOptions() {
  $("bookingTest").innerHTML = '<option value="">Choose a test</option>' + tests.map(t => `<option value="${esc(t.name)}">${esc(t.name)} — ${money(t.price)}</option>`).join("");
}
function statusClass(s) { return s === "Cancelled" ? "Cancelled" : s === "Completed" ? "Completed" : s === "Confirmed" ? "Confirmed" : ""; }
function renderBookings() {
  const bookings = getBookings();
  $("bookingCount").textContent = bookings.length;
  const list = $("bookingList");
  list.innerHTML = bookings.length ? bookings.slice().reverse().map(b => `<article class="booking-card"><div><h3>${esc(b.test)}</h3><p>${esc(b.id)} · ${esc(b.name)} · ${esc(b.phone)}</p><p>${esc(b.date)} at ${esc(b.time)} · ${esc(b.collection)}</p></div><div class="booking-meta"><span class="status ${statusClass(b.status)}">${esc(b.status)}</span><p style="margin-top:8px">${money(b.price)}</p>${b.status !== "Cancelled" ? `<button class="small-btn" data-cancel="${esc(b.id)}">Cancel booking</button>` : ""}</div></article>`).join("") : '<div class="empty">No bookings yet. Use the form above to book a test.</div>';
  renderAdmin();
}
function renderAdmin() {
  const q = $("adminSearch").value.toLowerCase();
  const filter = $("statusFilter").value;
  const bookings = getBookings().filter(b => [b.id,b.name,b.test,b.phone].some(v => String(v).toLowerCase().includes(q)) && (filter === "All" || b.status === filter));
  $("adminRows").innerHTML = bookings.length ? bookings.map(b => `<tr><td><b>${esc(b.id)}</b></td><td>${esc(b.name)}<br><span style="color:#6b7c89">${esc(b.phone)}</span></td><td>${esc(b.test)}<br>${money(b.price)}</td><td>${esc(b.date)}<br>${esc(b.time)}</td><td>${esc(b.collection)}</td><td><span class="status ${statusClass(b.status)}">${esc(b.status)}</span></td><td><select data-status="${esc(b.id)}" aria-label="Update status for ${esc(b.id)}">${["Booked","Confirmed","Sample Collected","Completed","Cancelled"].map(s => `<option ${b.status===s?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("") : '<tr><td colspan="7">No matching bookings.</td></tr>';
}
$("testSearch").addEventListener("input", e => renderTests(e.target.value));
$("adminSearch").addEventListener("input", renderAdmin);
$("statusFilter").addEventListener("change", renderAdmin);
$("testGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-book]");
  if (btn) { $("bookingTest").value = btn.dataset.book; $("booking").scrollIntoView({behavior:"smooth"}); }
});
$("bookingForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const test = tests.find(t => t.name === form.get("test"));
  if (!test) return;
  const booking = {
    id:"LL"+Date.now().toString().slice(-8),
    name:form.get("name").trim(), phone:form.get("phone").trim(), test:test.name, price:test.price,
    date:form.get("date"), time:form.get("time"), collection:form.get("collection"),
    notes:form.get("notes").trim(), status:"Booked"
  };
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  e.currentTarget.reset();
  $("formMessage").textContent = `Demo booking created successfully. Your booking ID is ${booking.id}.`;
  renderBookings();
  $("myBookings").scrollIntoView({behavior:"smooth"});
});
$("bookingList").addEventListener("click", e => {
  const btn = e.target.closest("[data-cancel]");
  if (!btn) return;
  const bookings = getBookings();
  const b = bookings.find(x => x.id === btn.dataset.cancel);
  if (b && confirm("Cancel this demo booking?")) { b.status = "Cancelled"; saveBookings(bookings); renderBookings(); }
});
$("adminRows").addEventListener("change", e => {
  const id = e.target.dataset.status;
  if (!id) return;
  const bookings = getBookings();
  const b = bookings.find(x => x.id === id);
  if (b) { b.status = e.target.value; saveBookings(bookings); renderBookings(); }
});
$("clearBookings").addEventListener("click", () => {
  if (getBookings().length && confirm("Delete all demo bookings from this browser?")) {
    saveBookings([]); $("formMessage").textContent = ""; renderBookings();
  }
});
$("appointmentDate").min = new Date().toLocaleDateString("en-CA");
$("year").textContent = new Date().getFullYear();
renderOptions(); renderTests(); renderBookings();
