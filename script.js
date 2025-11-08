let data = { locations: [] };

// Load data from Local Storage
const savedData = localStorage.getItem("machineData");
if (savedData) {
  try {
    data = JSON.parse(savedData);
  } catch {
    console.error("Corrupted Local Storage, resetting.");
    localStorage.removeItem("machineData");
    data = { locations: [] };
  }
}

// Save data to Local Storage
function saveData() {
  localStorage.setItem("machineData", JSON.stringify(data));
}

// Add Location
function addLocation() {
  const input = document.getElementById("locationInput");
  const name = input.value.trim();
  if (!name) return alert("Enter a location name!");
  if (data.locations.some(l => l.name.toLowerCase() === name.toLowerCase())) return alert("Location already exists!");

  data.locations.push({ name, machines: [] });
  input.value = '';

  saveData();
  updateDropdowns();   // Important: update dropdowns immediately
  displayData();
}

// Add Machine
function addMachine() {
  const locName = document.getElementById("locationSelect").value;
  const mName = document.getElementById("machineName").value.trim();
  const install = document.getElementById("machineInstall").value;
  const service = document.getElementById("machineService").value;
  if (!locName || !mName || !install || !service) return alert("Fill all fields!");

  const loc = data.locations.find(l => l.name === locName);
  loc.machines.push({ name: mName, installDate: install, serviceDate: service, equipments: [] });

  document.getElementById("machineName").value = "";
  document.getElementById("machineInstall").value = "";
  document.getElementById("machineService").value = "";

  saveData();
  updateDropdowns();
  displayData();
}

// Add Equipment
function addEquipment() {
  const locName = document.getElementById("locationForEquip").value;
  const machName = document.getElementById("machineSelect").value;
  const eName = document.getElementById("equipName").value.trim();
  const install = document.getElementById("equipInstall").value;
  const service = document.getElementById("equipService").value;
  if (!locName || !machName || !eName || !install || !service) return alert("Fill all fields!");

  const loc = data.locations.find(l => l.name === locName);
  const mach = loc.machines.find(m => m.name === machName);
  mach.equipments.push({ name: eName, installDate: install, serviceDate: service });

  document.getElementById("equipName").value = "";
  document.getElementById("equipInstall").value = "";
  document.getElementById("equipService").value = "";

  saveData();
  displayData();
}

// Update dropdowns using createElement
function updateDropdowns() {
  const locSelect = document.getElementById("locationSelect");
  const locForEquip = document.getElementById("locationForEquip");
  const machSelect = document.getElementById("machineSelect");

  locSelect.innerHTML = '';
  locForEquip.innerHTML = '';
  machSelect.innerHTML = '<option value="">Select Machine</option>';

  const defaultOption1 = document.createElement("option");
  defaultOption1.value = '';
  defaultOption1.textContent = 'Select Location';
  locSelect.appendChild(defaultOption1);

  const defaultOption2 = document.createElement("option");
  defaultOption2.value = '';
  defaultOption2.textContent = 'Select Location';
  locForEquip.appendChild(defaultOption2);

  data.locations.forEach(loc => {
    const opt1 = document.createElement("option");
    opt1.value = loc.name;
    opt1.textContent = loc.name;
    locSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = loc.name;
    opt2.textContent = loc.name;
    locForEquip.appendChild(opt2);
  });

  locForEquip.onchange = function() {
    const selectedLoc = data.locations.find(l => l.name === locForEquip.value);
    machSelect.innerHTML = '<option value="">Select Machine</option>';
    if (selectedLoc) {
      selectedLoc.machines.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.name;
        opt.textContent = m.name;
        machSelect.appendChild(opt);
      });
    }
  };
}

// Get service status
function getServiceStatus(date) {
  const today = new Date();
  const d = new Date(date);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "overdue";
  if (diff <= 10) return "near-service";
  return "";
}

// Display all data
function displayData() {
  const div = document.getElementById("dataDisplay");
  div.innerHTML = '';

  data.locations.forEach(loc => {
    const locCard = document.createElement("div");
    locCard.className = "card";
    locCard.innerHTML = `<h3>📍 ${loc.name}</h3>
      <button class="btn red" onclick="deleteLocation('${loc.name}')">Delete Location</button>`;

    loc.machines.forEach(m => {
      const mStatus = getServiceStatus(m.serviceDate);
      const machDiv = document.createElement("div");
      machDiv.className = `card ${mStatus}`;
      machDiv.innerHTML = `
        <h4>🛠 ${m.name}</h4>
        <p>Install: ${m.installDate} <button class="btn blue" onclick="editDate('machine','${loc.name}','${m.name}',null,'installDate')">Edit</button></p>
        <p>Service: ${m.serviceDate} <button class="btn blue" onclick="editDate('machine','${loc.name}','${m.name}',null,'serviceDate')">Edit</button></p>
        <button class="btn red" onclick="deleteMachine('${loc.name}','${m.name}')">Delete Machine</button>
      `;

      const equipDivContainer = document.createElement("div");
      equipDivContainer.style.marginLeft = "20px";

      m.equipments.forEach(e => {
        const eStatus = getServiceStatus(e.serviceDate);
        const eqDiv = document.createElement("div");
        eqDiv.className = `card ${eStatus}`;
        eqDiv.innerHTML = `
          <p>⚙️ ${e.name}</p>
          <p>Install: ${e.installDate} <button class="btn blue" onclick="editDate('equipment','${loc.name}','${m.name}','${e.name}','installDate')">Edit</button></p>
          <p>Service: ${e.serviceDate} <button class="btn blue" onclick="editDate('equipment','${loc.name}','${m.name}','${e.name}','serviceDate')">Edit</button></p>
          <button class="btn red" onclick="deleteEquipment('${loc.name}','${m.name}','${e.name}')">Delete Equipment</button>
        `;
        equipDivContainer.appendChild(eqDiv);
      });

      machDiv.appendChild(equipDivContainer);
      locCard.appendChild(machDiv);
    });

    div.appendChild(locCard);
  });
}

// Edit dates
function editDate(type, locName, machName, eqName, field) {
  const newDate = prompt("Enter new date (YYYY-MM-DD):");
  if (!newDate) return;
  const loc = data.locations.find(l => l.name === locName);
  if (type === "machine") loc.machines.find(m => m.name === machName)[field] = newDate;
  if (type === "equipment") loc.machines.find(m => m.name === machName).equipments.find(e => e.name === eqName)[field] = newDate;
  saveData();
  displayData();
}

// Delete functions
function deleteLocation(name) {
  if (!confirm(`Delete location ${name}?`)) return;
  data.locations = data.locations.filter(l => l.name !== name);
  saveData();
  updateDropdowns();
  displayData();
}
function deleteMachine(locName, mName) {
  if (!confirm(`Delete machine ${mName}?`)) return;
  const loc = data.locations.find(l => l.name === locName);
  loc.machines = loc.machines.filter(m => m.name !== mName);
  saveData();
  updateDropdowns();
  displayData();
}
function deleteEquipment(locName, mName, eName) {
  if (!confirm(`Delete equipment ${eName}?`)) return;
  const loc = data.locations.find(l => l.name === locName);
  const mach = loc.machines.find(m => m.name === mName);
  mach.equipments = mach.equipments.filter(e => e.name !== eName);
  saveData();
  displayData();
}

// Export to Excel
function exportToExcel() {
  const wb = XLSX.utils.book_new();
  const ws_data = [["Location","Machine","InstallDate","ServiceDate","Equipment","EquipInstall","EquipService"]];
  data.locations.forEach(l => {
    l.machines.forEach(m => {
      if (m.equipments.length === 0) ws_data.push([l.name,m.name,m.installDate,m.serviceDate,"","",""]);
      else m.equipments.forEach(e => ws_data.push([l.name,m.name,m.installDate,m.serviceDate,e.name,e.installDate,e.serviceDate]));
    });
  });
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "MachineData");
  XLSX.writeFile(wb, "MachineTracker.xlsx");
}

// Initialize
updateDropdowns();
displayData();
