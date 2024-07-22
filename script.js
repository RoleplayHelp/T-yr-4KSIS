// Hàm tính toán sát thương
function calculateDamage() {
    // Lấy giá trị từ input
    const atk = parseFloat(document.getElementById('atk').value);
    const dmgBuff = parseFloat(document.getElementById('dmgBuff').value) / 100 || 0;
    const penetration = parseFloat(document.getElementById('penetration').value) / 100 || 0;
    const weaponType = document.getElementById('weaponType').value;
    const element = document.getElementById('element').value;
    const def = parseFloat(document.getElementById('def').value);
    const hp = parseFloat(document.getElementById('hp').value);
    const hasBlock = document.getElementById('block').value === 'true';
    const distance = parseFloat(document.getElementById('distance').value);

    // Tính toán sát thương
    let damage = atk * (1 + dmgBuff);
    if (element === 'normal' && hp === 100) {
        damage *= 1.05;
    }

    const effectiveDef = def * (hasBlock ? 2 : 1) * (1 - penetration);
    const finalDamage = Math.max(0, damage - effectiveDef);

    // Tính toán hit-rate riêng biệt
    const weaponRange = weaponType === 'melee' ? 15 : 70;
    const hitRateReduction = Math.floor(distance / (weaponRange / 3)) * 0.2;
    const hitRate = Math.max(0, 1 - hitRateReduction);

    // Hiển thị kết quả
    displayResults(finalDamage, hitRate, {
        atk, dmgBuff, penetration, weaponType, element, def, hp, hasBlock, distance
    });
}

// Hàm hiển thị kết quả
function displayResults(damage, hitRate, params) {
    const resultElement = document.getElementById('result');
    let output = '<h3>Kết quả tính toán:</h3>';

    // Hiển thị kết quả chính với định dạng mới
    output += `<div class="main-result">
        <p><strong>Sát thương gây ra:</strong> <span class="highlight">${damage.toFixed(2)}</span></p>
        <p><strong>Hit-rate:</strong> <span class="highlight">${(hitRate * 100).toFixed(2)}%</span></p>
    </div>`;

    // Hiển thị công thức tính sát thương
    output += '<h4>Công thức tính sát thương:</h4>';
    output += '<pre>';
    output += `1. Sát thương cơ bản = ATK * (1 + dmgBuff) = ${params.atk} * (1 + ${params.dmgBuff}) = ${params.atk * (1 + params.dmgBuff)}\n`;
    if (params.element === 'normal' && params.hp === 100) {
        output += `2. Áp dụng bonus nguyên tố Normal: ${params.atk * (1 + params.dmgBuff)} * 1.05 = ${params.atk * (1 + params.dmgBuff) * 1.05}\n`;
    } else {
        output += '2. Không áp dụng bonus nguyên tố\n';
    }
    output += `3. Phòng thủ hiệu quả = DEF * (2 nếu block) * (1 - penetration) = ${params.def} * ${params.hasBlock ? 2 : 1} * (1 - ${params.penetration}) = ${params.def * (params.hasBlock ? 2 : 1) * (1 - params.penetration)}\n`;
    output += `4. Sát thương cuối cùng = Max(0, Sát thương - Phòng thủ hiệu quả) = ${damage.toFixed(2)}`;
    output += '</pre>';

    // Hiển thị công thức tính hit-rate
    output += '<h4>Công thức tính Hit-rate:</h4>';
    output += '<pre>';
    output += `Weapon Range: ${params.weaponType === 'melee' ? 15 : 70}m\n`;
    output += `Hit-rate = Max(0, 1 - (Math.floor(distance / (weaponRange / 3)) * 0.2))\n`;
    output += `         = Max(0, 1 - (${Math.floor(params.distance / ((params.weaponType === 'melee' ? 15 : 70) / 3))} * 0.2))\n`;
    output += `         = ${hitRate.toFixed(2)}`;
    output += '</pre>';

    resultElement.innerHTML = output;
}

// Gắn sự kiện cho nút tính toán
document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.querySelector('button');
    calculateButton.addEventListener('click', calculateDamage);
});