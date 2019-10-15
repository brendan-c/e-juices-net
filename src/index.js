import "./styles.css";

const $ = selector => document.querySelector(selector);
const rnd = n => Number(n).toFixed(2);

let flavors = [];

const input = {
  target: {
    str: $("#targetStr"),
    vol: $("#targetVolume"),
    pg: $("#targetPG"),
    vg: $("#targetVG")
  },
  base: {
    str: $("#baseStr"),
    pg: $("#basePG"),
    vg: $("#baseVG")
  }
};

let total = {
  base: {
    g: $("#total_base_g"),
    ml: $("#total_base_ml"),
    p: $("#total_base_p")
  },
  nic: {
    g: $("#total_nic_g"),
    ml: $("#total_nic_ml"),
    p: $("#total_nic_p")
  },
  pg: {
    g: $("#total_pg_g"),
    ml: $("#total_pg_ml"),
    p: $("#total_pg_p")
  },
  vg: {
    g: $("#total_vg_g"),
    ml: $("#total_vg_ml"),
    p: $("#total_vg_p")
  }
};

let weights = {
  nic: 1.01,
  vg: 1.26,
  pg: 1.038,
  flavor: 1.0
};

function calcTotalBaseNic() {
  const nicPercent = input.base.str.value / 1000;
  const nicVolume = nicPercent * total.base.ml.innerText;
  //console.log(calcTotalBase() - nicVolume);
  return nicVolume;
}

function calcTotalBaseVolume() {
  return rnd(
    input.target.vol.value * (input.target.str.value / input.base.str.value)
  );
}

function calcTotalPGVolume() {
  const targetPGVolume = (input.target.pg.value / 100) * input.target.vol.value;
  const basePGVolume =
    (calcTotalBaseVolume() - calcTotalBaseNic()) *
    (input.target.pg.value / 100);
  return rnd(targetPGVolume - basePGVolume - calcTotalFlavorVolume(flavors));
}

function calcTotalVGVolume() {
  const targetVGVolume = (input.target.vg.value / 100) * input.target.vol.value;
  const baseVGVolume =
    (calcTotalBaseVolume() - calcTotalBaseNic()) * (input.base.vg.value / 100);
  return rnd(targetVGVolume - baseVGVolume - calcTotalFlavorVolume(flavors));
}

function calcTotalBaseWeight() {
  const nicWeight = calcTotalBaseNic() * weights.nic;
  const pgWeight =
    calcTotalBaseVolume() * (input.base.pg.value / 100) * weights.pg;
  const vgWeight =
    calcTotalBaseVolume() * (input.base.vg.value / 100) * weights.vg;
  return rnd(nicWeight + pgWeight + vgWeight);
}

function calcTotalPGWeight() {
  return rnd(calcTotalPGVolume() * weights.pg);
}

function calcTotalVGWeight() {
  return rnd(calcTotalVGVolume() * weights.vg);
}

function calcFlavorVolume(obj) {
  if (obj.percentage === 0) return 0;
  return (obj.percentage / 100) * input.target.vol.value;
}

function calcFlavorWeight(obj) {
  if (!flavors.length || obj.percentage === 0) {
    return 0;
  }
  return calcFlavorVolume(obj) * weights.flavor;
}

function calcTotalFlavorVolume() {
  let totalVolume = 0;
  flavors.forEach(flavor => {
    totalVolume += calcFlavorWeight(flavor);
  });
  return totalVolume;
}

total.base.ml.innerText = calcTotalBaseVolume();
total.pg.ml.innerText = calcTotalPGVolume();
total.vg.ml.innerText = calcTotalVGVolume();

total.base.g.innerText = calcTotalBaseWeight();
total.pg.g.innerText = calcTotalPGWeight();
total.vg.g.innerText = calcTotalVGWeight();

total.nic.ml.innerText = calcTotalBaseNic();
total.nic.g.innerText = rnd(calcTotalBaseNic() * weights.nic);
total.nic.p.innerText = rnd(calcTotalBaseNic() / input.target.vol.value) * 100;

total.base.p.innerText = rnd(
  (calcTotalBaseVolume() / input.target.vol.value) * 100
);
total.pg.p.innerText = rnd(
  (calcTotalPGVolume() / input.target.vol.value) * 100
);
total.vg.p.innerText = rnd(
  (calcTotalVGVolume() / input.target.vol.value) * 100
);

input.target.pg.value = 50;
input.base.pg.value = 50;

input.target.pg.addEventListener("input", e => {
  input.target.vg.value = 100 - e.target.value;
});

input.target.vg.addEventListener("input", e => {
  input.target.pg.value = 100 - e.target.value;
});

input.base.pg.addEventListener("input", e => {
  input.base.vg.value = 100 - e.target.value;
});

input.base.vg.addEventListener("input", e => {
  input.base.pg.value = 100 - e.target.value;
});

document.addEventListener("input", e => {
  if (
    e.target.id === "baseStr" ||
    e.target.id === "targetStr" ||
    e.target.id === "targetVolume"
  ) {
    total.base.g.innerText = calcTotalBaseWeight();
    total.base.ml.innerText = calcTotalBaseVolume();
  }
  total.pg.g.innerText = calcTotalPGWeight();
  total.vg.g.innerText = calcTotalVGWeight();
  total.pg.ml.innerText = calcTotalPGVolume();
  total.vg.ml.innerText = calcTotalVGVolume();
  total.base.p.innerText = rnd(
    (calcTotalBaseVolume() / input.target.vol.value) * 100
  );
  total.pg.p.innerText = rnd(
    (calcTotalPGVolume() / input.target.vol.value) * 100
  );
  total.vg.p.innerText = rnd(
    (calcTotalVGVolume() / input.target.vol.value) * 100
  );
  total.nic.ml.innerText = rnd(calcTotalBaseNic());
  total.nic.g.innerText = rnd(calcTotalBaseNic() * weights.nic);
  total.nic.p.innerText =
    rnd(calcTotalBaseNic() / input.target.vol.value) * 100;
});

$(".showNic").addEventListener("click", e => {
  $("#nic").classList.toggle("hide");
});

function updateFlavors() {
  $("#flavorResults").innerHTML = "";
  $("#flavor-container").innerHTML = "";
  flavors.forEach(flavor => {
    $("#flavor-container").innerHTML += `
        <div class="flavor-group field-body" data-id=${flavor.id}>
          <input
            type="text"
            class="flavorName input"
            placeholder="Flavor name"
            value=${flavor.name ? flavor.name : "Flavor"}
          />
          <div class="field has-addons">
          <p class="control">
              <input
                type="number"
                class="flavorPercentage input"
                placeholder="Flavor %"
                min="0"
                max="100"
                step="0.5"
                value=${flavor.percentage ? flavor.percentage : 0}
              />
              <p class="control">
              <a class="button is-static">
                %
              </a>
            </p>
          </div>
          <div class="btn_delete-flavor button is-outlined">
          x
          </div>
            </div>
        </div>
      `;

    $("#flavorResults").innerHTML += `
      <tr class="tr" data-id=${flavor.id}>
        <td class="flavor_name td">${flavor.name ? flavor.name : "Flavor"}</td>
        <td class="td"><span class="flavor_g"></span> g</td>
        <td class="td"><span class="flavor_ml"></span> ml</td>
        <td class="td"><span class="flavor_p">${
          flavor.percentage ? flavor.percentage : ""
        }</span> %</td>
      </tr>
    `;
  });
}

$("#add-flavor").addEventListener("click", e => {
  flavors.push({
    id: Date.now().toString(),
    name: null,
    percentage: null
  });
  updateFlavors();
  //updateDeleteButtons()
});

$("#flavor-container").addEventListener("click", e => {
  if (e.target.classList.contains("btn_delete-flavor")) {
    flavors = flavors.filter(
      flavor => flavor.id !== e.target.parentNode.dataset.id
    );
    updateFlavors();
  }
});

$("#show-flavors").addEventListener("click", e => {
  console.log(flavors);
});

$("#flavor-container").addEventListener("input", e => {
  if (e.target.classList.contains("flavorName")) {
    let id = e.target.parentNode.dataset.id;
    let index = flavors.map(f => f.id).indexOf(id);
    flavors[index].name = e.target.value;
    $("#flavorResults")
      .querySelector(`tr[data-id="${id}"]`)
      .querySelector(".flavor_name").innerText = e.target.value;
    console.log(e.target.value);
  }
  if (e.target.classList.contains("flavorPercentage")) {
    console.log(e.target.classList);
    let id = e.target.parentNode.parentNode.parentNode.dataset.id;
    let index = flavors.map(f => f.id).indexOf(id);
    flavors[index].percentage = e.target.value;
    $("#flavorResults")
      .querySelector(`tr[data-id="${id}"]`)
      .querySelector(".flavor_p").innerText = e.target.value;
    $("#flavorResults")
      .querySelector(`tr[data-id="${id}"]`)
      .querySelector(".flavor_g").innerText = rnd(
      calcFlavorWeight(flavors[index])
    );
    $("#flavorResults")
      .querySelector(`tr[data-id="${id}"]`)
      .querySelector(".flavor_ml").innerText = rnd(
      calcFlavorVolume(flavors[index])
    );
  }
});
