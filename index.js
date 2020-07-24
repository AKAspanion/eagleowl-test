document.getElementById("fileInput").addEventListener("change", getFile);

function processData(file) {
  const data = [];
  const lines = file.split("\n");
  const title = lines.splice(0, 1);
  const titles = title[0].split(",");
  const lineLength = lines.length;
  const titleLength = titles.length;

  for (let i = 0; i < lineLength; i++) {
    const newData = {};
    const lineData = lines[i].split(",");
    for (let j = 0; j < titleLength; j++) {
      newData[(titles[j] || "").toLowerCase().trim()] = (
        lineData[j] || ""
      ).trim();
    }
    data.push(newData);
  }
  return data.filter((d) => !!d.phone);
}

function calculateStats(data) {
  // map to store data with phone no as key
  const userMap = new Map();

  data.forEach(({ amount, date, name, phone }) => {
    if (userMap.has(phone)) {
      const item = userMap.get(phone);
      userMap.set(phone, {
        ...item,
        totalOrders: item.totalOrders + 1,
        totalAmount: item.totalAmount + Number(amount),
        purchaseHistory: [
          ...item.purchaseHistory,
          {
            [date]: Number(amount),
          },
        ],
      });
    } else {
      userMap.set(phone, {
        name,
        phone,
        purchaseHistory: [
          {
            [date]: Number(amount),
          },
        ],
        totalOrders: 1,
        totalAmount: Number(amount),
      });
    }
  });

  let totalAmountSum = 0;
  let totalOrdersCount = 0;
  const customerOrderDistribution = [...Array(5)].map(() => []);
  userMap.forEach((user) => {
    const { totalOrders, totalAmount } = user;

    const normalizedOrders = totalOrders > 5 ? 4 : totalOrders - 1;
    customerOrderDistribution[normalizedOrders] = [
      ...customerOrderDistribution[normalizedOrders],
      user,
    ];

    totalOrdersCount += totalOrders;
    totalAmountSum += totalAmount;
  });

  return {
    totalAmountSum,
    totalOrdersCount,
    customerOrderDistribution,
  };
}

function renderStats(file) {
  const data = processData(file);

  const aggregatedStat = calculateStats(data);
  console.log(aggregatedStat);
}

function getFile(event) {
  fileParser(event, renderStats);
}

function fileParser(e, callback) {
  e.preventDefault();
  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    callback(text);
  };
  reader.readAsText(e.target.files[0]);
}
