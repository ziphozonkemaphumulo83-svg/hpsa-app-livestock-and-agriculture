import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaOrMKZXZtJKD646bARehuTOxCe4DzsLk",
  authDomain: "hpsa-app-6b2d2.firebaseapp.com",
  projectId: "hpsa-app-6b2d2",
  storageBucket: "hpsa-app-6b2d2.appspot.com",
  messagingSenderId: "445389782453",
  appId: "1:445389782453:web:595647fa1038fab9886dfc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch(err => console.warn("IndexedDB persistence failed:", err));

const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => (toast.style.display = "none"), 300);
  }, 2500);
}

function parseNumber(value) { return Number(value) || 0; }

function loadProfileHeader() {
  const profileData = JSON.parse(localStorage.getItem("censusUserProfile"));
  const header = document.getElementById("profileHeader");
  if (!profileData) {
    header.innerHTML = `<p style="color:#ccc; font-style:italic;">No profile found</p>`;
    return;
  }
  header.innerHTML = `
    <h2>Project Code: ${profileData.projectCode || "-"}</h2>
    <p>Participant: ${profileData.participant || "-"}</p>
    <p>Village: ${profileData.village || "-"}</p>
    <p>Dip Tank: ${profileData.dipTank || "-"}</p>
  `;
}

// Cached data to avoid multiple Firestore reads
let cachedData = [];

async function fetchAllData() {
  if (cachedData.length) return cachedData;
  const snapshot = await getDocs(collection(db, "sensusData"));
  cachedData = snapshot.docs.map(doc => doc.data());
  return cachedData;
}

function analyzeData(data) {
  const sum = key => data.reduce((t,d) => t + parseNumber(d[key]), 0);
  const avg = key => data.length ? (sum(key)/data.length).toFixed(1) : 0;

  const stats = {
    count: data.length,
    goats: sum("goats"),
    chickens: sum("chickens"),
    kidsBorn: sum("kidsBorn"),
    kidsSurvived: sum("kidsSurvived"),
    goatsStolen: sum("goatsStolen"),
    goatsDied: sum("goatsDied"),
    chickensStolen: sum("chickensStolen"),
    chickensDied: sum("chickensDied"),
    avgGoats: avg("goats"),
    avgChickens: avg("chickens")
  };

  stats.goatTheftRate = stats.goats ? ((stats.goatsStolen / stats.goats) * 100).toFixed(1) : 0;
  stats.goatMortalityRate = stats.goats ? ((stats.goatsDied / stats.goats) * 100).toFixed(1) : 0;
  stats.kidSurvivalRate = stats.kidsBorn ? ((stats.kidsSurvived / stats.kidsBorn) * 100).toFixed(1) : 0;
  stats.chickenTheftRate = stats.chickens ? ((stats.chickensStolen / stats.chickens) * 100).toFixed(1) : 0;
  stats.chickenMortalityRate = stats.chickens ? ((stats.chickensDied / stats.chickens) * 100).toFixed(1) : 0;

  return stats;
}

function renderKPIs(stats) {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = "";
  const card = (label,value,sub="")=>{
    const div = document.createElement("div");
    div.className = "kpi-card";
    div.innerHTML = `<div class="kpi-title">${label}</div><div class="kpi-value">${value}</div><div class="kpi-subtext">${sub}</div>`;
    return div;
  };
  grid.append(
    card("Households", stats.count),
    card("Goats", stats.goats),
    card("Chickens", stats.chickens),
    card("Goat Theft", stats.goatsStolen, `Rate: ${stats.goatTheftRate}%`),
    card("Goat Deaths", stats.goatsDied, `Mortality: ${stats.goatMortalityRate}%`),
    card("Kid Survival", stats.kidsSurvived, `Rate: ${stats.kidSurvivalRate}%`),
    card("Chicken Theft", stats.chickensStolen, `Rate: ${stats.chickenTheftRate}%`),
    card("Chicken Deaths", stats.chickensDied, `Rate: ${stats.chickenMortalityRate}%`),
    card("Avg Goats/HH", stats.avgGoats),
    card("Avg Chickens/HH", stats.avgChickens)
  );
}

function renderSummary(stats) {
  const block = document.getElementById("summaryBlock");
  const list = document.getElementById("summaryList");
  list.innerHTML = "";
  const items = [
    ["Total Households", stats.count],
    ["Total Goats", stats.goats],
    ["Total Chickens", stats.chickens],
    ["Goat Theft Rate", `${stats.goatTheftRate}%`],
    ["Goat Mortality Rate", `${stats.goatMortalityRate}%`],
    ["Kid Survival Rate", `${stats.kidSurvivalRate}%`],
    ["Chicken Theft Rate", `${stats.chickenTheftRate}%`],
    ["Chicken Mortality Rate", `${stats.chickenMortalityRate}%`],
    ["Avg Goats/HH", stats.avgGoats],
    ["Avg Chickens/HH", stats.avgChickens]
  ];
  items.forEach(([label,value])=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${label}</span><strong>${value}</strong>`;
    list.appendChild(li);
  });
  block.style.display = "block";
}

let currentFilterField = "";
window.submitFilter = async function() {
  const val = document.getElementById("filterInput").value.trim().toLowerCase();
  closeModal();
  if(!val) return showToast("No value entered");
  const all = await fetchAllData();
  const filtered = all.filter(item => ((item[currentFilterField]||"").toString().toLowerCase()).includes(val));
  if(!filtered.length) return showToast(`No entries for "${val}"`);
  const stats = analyzeData(filtered);
  renderKPIs(stats);
  renderSummary(stats);
};

window.closeModal = () => document.getElementById("filterModal").style.display="none";

const openModal = (label,field)=>{
  currentFilterField = field;
  const modal = document.getElementById("filterModal");
  document.getElementById("modalLabel").textContent = `Enter ${label}`;
  document.getElementById("filterInput").value = "";
  modal.style.display = "flex";
  document.getElementById("filterInput").focus();
};

// Attach buttons
document.getElementById("filterDipBtn").onclick = ()=>openModal("Dip Tank","dipTank");
document.getElementById("filterParticipantBtn").onclick = ()=>openModal("Participant","participant");
document.getElementById("filterVillageBtn").onclick = ()=>openModal("Village","village");
document.getElementById("clearFilterBtn").onclick = async ()=>{
  const all = await fetchAllData();
  const stats = analyzeData(all);
  renderKPIs(stats);
  renderSummary(stats);
  showToast("Filters cleared");
};

// Logout
document.getElementById("logoutBtn").onclick = ()=>document.getElementById("logoutConfirm").style.display="flex";
window.confirmLogout = ()=>{
  signOut(auth).then(()=>{
    localStorage.clear();
    sessionStorage.clear();
    window.location.href="index.html";
  }).catch(()=>showToast("Logout failed"));
};
window.closeLogoutPopup = ()=>document.getElementById("logoutConfirm").style.display="none";

// CSV Export
document.getElementById("exportBtn").onclick = async ()=>{
  const all = await fetchAllData();
  if(!all.length) return showToast("No data to export.");
  const fields=[
    "participant","projectCode","village","dipTank","cellNumber","cahwName",
    "municipalNumber","date","farmerName","farmerCell","male","female","youth","adult","disability",
    "cows","cowsUsed","cowsSold","cowsStolen","cowsDied",
    "goats","goatsUsed","goatsSold","goatsStolen","goatsDied",
    "kidsBorn","kidsSurvived","chickens","chickensUsed","chickensSold","chickensStolen","chickensDied",
    "goatDiseases","vaccinated","medicines","feed","createdAt"
  ];
  const rows=[fields.join(",")];
  all.forEach(entry=>{
    const row = fields.map(k=>`"${(entry[k]??"").toString().replace(/"/g,'""')}"`);
    rows.push(row.join(","));
  });
  const blob = new Blob([rows.join("\n")],{type:"text/csv"});
  const a=document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download="census_report.csv";
  a.click();
};

// Initialize
loadProfileHeader();
fetchAllData().then(data=>{
  const stats = analyzeData(data);
  renderKPIs(stats);
  renderSummary(stats);
});
