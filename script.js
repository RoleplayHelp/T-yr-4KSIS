// Hàm tính toán sát thương
function calculateDamage() {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.style.display = 'none';

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
        { id: 'atk', name: 'ATK' },
        { id: 'def', name: 'DEF' },
        { id: 'currentHP', name: 'HP hiện tại' },
        { id: 'maxHP', name: 'HP tối đa' },
        { id: 'x1', name: 'X1' },
        { id: 'y1', name: 'Y1' },
        { id: 'x2', name: 'X2' },
        { id: 'y2', name: 'Y2' }
    ];
    let missingFields = [];
    for (let field of requiredFields) {
        if (document.getElementById(field.id).value.trim() === '') {
            missingFields.push(field.name);
        }
    }
    if (missingFields.length > 0) {
        errorMessageElement.textContent = `Vui lòng nhập đầy đủ các trường sau: ${missingFields.join(', ')}`;
        errorMessageElement.style.display = 'block';
        return;
    }

    // Lấy giá trị từ input và kiểm tra NaN
    const atk = parseFloat(document.getElementById('atk').value) || 0;
    const dmgBuff = parseFloat(document.getElementById('dmgBuff').value) / 100 || 0;
    const penetration = parseFloat(document.getElementById('penetration').value) / 100 || 0;
    const weaponType = document.getElementById('weaponType').value || 'melee';
    const rangedWeaponType = document.getElementById('rangedWeaponType').value || 'mainArmament';
    const attackerElement = document.getElementById('attackerElement').value || 'normal';
    const accModifier = parseFloat(document.getElementById('accModifier').value) / 100 || 0;
    const def = parseFloat(document.getElementById('def').value) || 0;
    const currentHP = parseFloat(document.getElementById('currentHP').value) || 0;
    const maxHP = parseFloat(document.getElementById('maxHP').value) || 1; // Tránh chia cho 0
    const defenderAction = document.getElementById('defenderAction').value || 'none';
    const evasion = parseFloat(document.getElementById('evasion').value) / 100 || 0;
    const evaModifier = parseFloat(document.getElementById('evaModifier').value) / 100 || 0;
    const x1 = parseFloat(document.getElementById('x1').value) || 0;
    const y1 = parseFloat(document.getElementById('y1').value) || 0;
    const x2 = parseFloat(document.getElementById('x2').value) || 0;
    const y2 = parseFloat(document.getElementById('y2').value) || 0;
    const defenderElement = document.getElementById('defenderElement').value || 'none';
    const damageReduction = parseFloat(document.getElementById('damageReduction').value) / 100 || 0;

    // Tính khoảng cách từ tọa độ
    const distance = Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));

    // Tính phần trăm HP hiện tại
    const hpPercentage = (currentHP / maxHP) * 100;

    // Tính toán hiệu ứng nguyên tố của người phòng thủ
    let defReduction = 0;
    let dotDamage = 0;
    if (defenderElement === 'burn') {
        defReduction = 0.1;
        dotDamage = 0.03 * maxHP;
    } else if (defenderElement === 'beam') {
        defReduction = 0.2;
    } else if (defenderElement === 'poison') {
        dotDamage = 0.03 * maxHP;
    }
    let effectiveDef = def * (1 - defReduction);

    // Tính toán sát thương cơ bản
    let baseDamage = atk;
    let weaponDamageMultiplier = 1;
    if (weaponType === 'ranged') {
        switch (rangedWeaponType) {
            case 'mainArmament': weaponDamageMultiplier = 0.8; break;
            case 'secondaryArmament': weaponDamageMultiplier = 0.6; break;
            case 'missile': weaponDamageMultiplier = 0.4; break;
            case 'ultimateWeapon': weaponDamageMultiplier = 1.5; break;
        }
    }
    baseDamage *= weaponDamageMultiplier;

    // Áp dụng hiệu ứng nguyên tố của người tấn công
    let elementalMultiplier = 1;
    if (attackerElement === 'normal') {
        if (hpPercentage <= 25) elementalMultiplier = 1.20;
        else if (hpPercentage <= 50) elementalMultiplier = 1.15;
        else if (hpPercentage <= 75) elementalMultiplier = 1.10;
        else if (hpPercentage < 100) elementalMultiplier = 1.05;
    } else if (attackerElement === 'explosive') {
        const hpLost = (100 - hpPercentage) / 10;
        const defIgnore = hpLost * 0.025;
        effectiveDef *= (1 - defIgnore);
    }
    baseDamage *= elementalMultiplier;

    // Áp dụng khoảng cách để giảm sát thương
    const maxRange = weaponType === 'melee' ? 15 : 70;
    let distancePenalty = 1;
    let outOfRange = false;
    if (distance <= maxRange) {
        const penaltySteps = Math.floor(distance / (maxRange / 3));
        distancePenalty = Math.max(0, 1 - penaltySteps * 0.2);
    } else {
        distancePenalty = 0;
        outOfRange = true; // Đánh dấu ngoài phạm vi
    }

    // Áp dụng khuếch đại sát thương và giảm sát thương
    let damageMultiplier = (1 + dmgBuff - damageReduction) * distancePenalty;
    damageMultiplier = Math.max(0, damageMultiplier);

    // Tính toán sát thương cuối cùng
    effectiveDef *= (defenderAction === 'block' ? 2 : 1) * (1 - penetration);
    let finalDamage = Math.max(0, baseDamage * damageMultiplier - effectiveDef);

    // Hiển thị kết quả
    displayResults(finalDamage, dotDamage, distance, outOfRange, {
        atk, dmgBuff, penetration, weaponType, rangedWeaponType, attackerElement, def, currentHP, maxHP, defenderAction, evasion, distance, defenderElement, defReduction, effectiveDef, hpPercentage, damageMultiplier, damageReduction, weaponDamageMultiplier, elementalMultiplier, accModifier, evaModifier
    });
}

function displayResults(damage, dotDamage, distance, outOfRange, params) {
    const resultElement = document.getElementById('result');
    let output = '<h3>Kết quả tính toán:</h3>';

    // Đảm bảo các giá trị là số
    const safeDamage = typeof damage === 'number' ? damage : 0;
    const safeDotDamage = typeof dotDamage === 'number' ? dotDamage : 0;
    const safeDistance = typeof distance === 'number' ? distance : 0;

    output += `<div class="main-result">
        <p><strong>Khoảng cách:</strong> ${safeDistance} m</p>
        <p><strong>Sát thương gây ra:</strong> <span class="highlight">${outOfRange ? '0 dmg - ngoài phạm vi vũ khí' : safeDamage.toFixed(2)}</span></p>`;
    if (safeDotDamage > 0) {
        output += `<p><strong>Sát thương theo thời gian (DoT):</strong> <span class="highlight">${safeDotDamage.toFixed(2)}</span></p>`;
    }
    output += `</div>`;

    output += '<h4>Công thức tính sát thương:</h4>';
    output += '<pre>';
    output += `1. Sát thương cơ bản = ATK = ${(params.atk || 0).toFixed(2)}\n`;
    if (params.weaponType === 'ranged') {
        output += `2. Áp dụng hệ số sát thương cho vũ khí ${params.rangedWeaponType}: ${(params.atk || 0).toFixed(2)} * ${(params.weaponDamageMultiplier || 1).toFixed(2)} = ${((params.atk || 0) * (params.weaponDamageMultiplier || 1)).toFixed(2)}\n`;
    }
    if (params.attackerElement === 'normal') {
        output += `3. Áp dụng bonus nguyên tố Normal (HP ${(params.hpPercentage || 0).toFixed(2)}%): ${((params.atk || 0) * (params.weaponDamageMultiplier || 1)).toFixed(2)} * ${(params.elementalMultiplier || 1).toFixed(2)} = ${((params.atk || 0) * (params.weaponDamageMultiplier || 1) * (params.elementalMultiplier || 1)).toFixed(2)}\n`;
    } else if (params.attackerElement === 'explosive') {
        const hpLost = (100 - (params.hpPercentage || 0)) / 10;
        const defIgnore = hpLost * 0.025;
        output += `3. Áp dụng nguyên tố Explosive: Bỏ qua ${(defIgnore * 100).toFixed(2)}% DEF\n`;
    } else {
        output += `3. Nguyên tố Khác: Không có hiệu ứng đặc biệt\n`;
    }
    output += `4. Áp dụng khuếch đại sát thương và giảm sát thương:\n`;
    output += `   Hệ số cuối cùng = 1 + ${(params.dmgBuff || 0).toFixed(2)} (khuếch đại) - ${(params.damageReduction || 0).toFixed(2)} (giảm) * ${(params.distancePenalty || 1).toFixed(2)} (phạt khoảng cách) = ${(params.damageMultiplier || 0).toFixed(2)}\n`;
    output += `   Sát thương sau khi áp dụng = ${((params.atk || 0) * (params.weaponDamageMultiplier || 1) * (params.elementalMultiplier || 1)).toFixed(2)} * ${(params.damageMultiplier || 0).toFixed(2)} = ${((params.atk || 0) * (params.weaponDamageMultiplier || 1) * (params.elementalMultiplier || 1) * (params.damageMultiplier || 0)).toFixed(2)}\n`;
    if (params.defenderElement !== 'none') {
        output += `5. Áp dụng hiệu ứng ${params.defenderElement}: `;
        if (params.defenderElement === 'burn' || params.defenderElement === 'beam') {
            output += `Giảm ${((params.defReduction || 0) * 100).toFixed(2)}% DEF\n`;
        }
        if (params.defenderElement === 'burn' || params.defenderElement === 'poison') {
            output += `   Gây thêm sát thương DoT: 3% của ${(params.maxHP || 1).toFixed(2)} = ${(safeDotDamage).toFixed(2)}\n`;
        }
    }
    output += `6. Phòng thủ hiệu quả = DEF * (1 - defReduction) * (2 nếu block) * (1 - penetration) = ${(params.def || 0).toFixed(2)} * (1 - ${(params.defReduction || 0).toFixed(2)}) * ${params.defenderAction === 'block' ? 2 : 1} * (1 - ${(params.penetration || 0).toFixed(2)}) = ${(params.effectiveDef || 0).toFixed(2)}\n`;
    output += `7. Sát thương cuối cùng = Max(0, Sát thương - Phòng thủ hiệu quả) = ${outOfRange ? '0 (ngoài phạm vi)' : safeDamage.toFixed(2)}\n`;
    output += '</pre>';

    resultElement.innerHTML = output;
}

// Hàm tung xúc xắc độc lập
function rollDice() {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.style.display = 'none';

    const thresholdInput = document.getElementById('diceThreshold').value.trim();
    if (thresholdInput === '') {
        errorMessageElement.textContent = 'Vui lòng nhập tỉ lệ thành công (%).';
        errorMessageElement.style.display = 'block';
        return;
    }

    const threshold = parseFloat(thresholdInput);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        errorMessageElement.textContent = 'Tỉ lệ phải là số từ 0 đến 100.';
        errorMessageElement.style.display = 'block';
        return;
    }

    const diceRoll = Math.floor(Math.random() * 101); // 0-100
    const result = diceRoll <= threshold ? 'Success!' : 'Fail!';

    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `
        <h3>Kết quả Roll Dice:</h3>
        <p><strong>Tỉ lệ thành công:</strong> ${threshold}%</p>
        <p><strong>Giá trị xúc xắc (0-100):</strong> ${diceRoll}</p>
        <p><strong>Kết quả:</strong> <span class="highlight">${result}</span></p>
    `;
}

// Hiển thị modal Help
function showHelp() {
    const modal = document.getElementById('helpModal');
    const content = document.getElementById('helpContent');
    
    content.innerHTML = `
        <h3>Giải thích các trường nhập liệu:</h3>
        <h4 class="attacker">Người Tấn Công (Attacker):</h4>
        <ul>
            <li><strong>ATK:</strong> <span class="description">Sức tấn công của người tấn công.</span></li>
            <li><strong>Buff khuếch đại sát thương:</strong> <span class="description">Phần trăm tăng sát thương (không bắt buộc).</span></li>
            <li><strong>Buff xuyên kháng:</strong> <span class="description">Phần trăm bỏ qua phòng thủ của đối phương (không bắt buộc).</span></li>
            <li><strong>Loại vũ khí:</strong> <span class="description">Melee (cận chiến, tầm đánh <span class="value">15m</span>) hoặc Ranged (tầm xa, tầm đánh <span class="value">70m</span>).</span></li>
            <li><strong>Loại vũ khí tầm xa:</strong>
                <ul>
                    <li><span class="weapon">Main Armament:</span> <span class="description"><span class="value">80% ATK</span>, nạp <span class="value">10% IS</span>, <span class="value">2 lượt</span> nạp đạn.</span></li>
                    <li><span class="weapon">Secondary Armament:</span> <span class="description"><span class="value">60% ATK</span>, nạp <span class="value">8% IS</span>, <span class="value">1 lượt</span> nạp đạn.</span></li>
                    <li><span class="weapon">Missile:</span> <span class="description"><span class="value">40% ATK</span>, nạp <span class="value">5% IS</span>, <span class="value">2 lượt</span> nạp đạn. Có thể dùng cùng lúc với vũ khí khác.</span></li>
                    <li><span class="weapon">Ultimate Weapon:</span> <span class="description"><span class="value">150% ATK</span>, nạp <span class="value">20% IS</span>, <span class="value">7 lượt</span> nạp đạn. Chỉ có ở mecha bậc SS trở lên.</span></li>
                </ul>
            </li>
            <li><strong>Nguyên tố:</strong>
                <ul>
                    <li><span class="element">Normal:</span> <span class="description">Tăng sát thương khi HP đối phương giảm (<span class="value">5%/10%/15%/20%</span> khi HP dưới <span class="value">100%/75%/50%/25%</span>).</span></li>
                    <li><span class="element">Explosive:</span> <span class="description">Bỏ qua <span class="value">2.5% DEF</span> cho mỗi <span class="value">10%</span> máu đã mất của đối phương.</span></li>
                    <li><span class="element">Khác:</span> <span class="description">Không có hiệu ứng đặc biệt.</span></li>
                </ul>
            </li>
            <li><strong>Acc Modifier:</strong> <span class="description">Điều chỉnh độ chính xác của người tấn công (%).</span></li>
        </ul>
        <h4 class="defender">Người Phòng Thủ (Defender):</h4>
        <ul>
            <li><strong>DEF:</strong> <span class="description">Chỉ số phòng thủ của người phòng thủ.</span></li>
            <li><strong>HP hiện tại:</strong> <span class="description">Lượng máu hiện tại của người phòng thủ.</span></li>
            <li><strong>HP tối đa:</strong> <span class="description">Lượng máu tối đa của người phòng thủ.</span></li>
            <li><strong>Hành động:</strong> <span class="description">Chọn hành động của người phòng thủ (Không hành động, Block, hoặc Né tránh).</span></li>
            <li><strong>Evasion:</strong> <span class="description">Tỷ lệ né tránh của người phòng thủ (%) khi chọn hành động Né tránh.</span></li>
            <li><strong>Eva Modifier:</strong> <span class="description">Điều chỉnh khả năng né tránh của người phòng thủ (%).</span></li>
            <li><strong>Hiệu ứng:</strong>
                <ul>
                    <li><span class="effect">Burn:</span> <span class="description">Gây sát thương <span class="value">3% HP tối đa</span>, giảm <span class="value">10% DEF</span>.</span></li>
                    <li><span class="effect">Poison:</span> <span class="description">Gây sát thương <span class="value">3% HP tối đa</span>.</span></li>
                    <li><span class="effect">Beam:</span> <span class="description">Giảm <span class="value">20% DEF</span>.</span></li>
                </ul>
            </li>
            <li><strong>Giảm sát thương nhận vào (%):</strong> <span class="description">Phần trăm giảm sát thương của người phòng thủ.</span></li>
        </ul>
        <h4 class="distance">Khoảng Cách:</h4>
        <ul>
            <li><span class="description">Khoảng cách giữa người tấn công và người phòng thủ, ảnh hưởng đến sát thương (giảm 20% mỗi 1/3 tầm đánh).</span></li>
            <li><span class="description">Khoảng cách tối đa: Melee <span class="value">15m</span>, Ranged <span class="value">70m</span>. Vượt quá sẽ có sát thương 0.</span></li>
        </ul>
        <h4>Randomizer:</h4>
        <ul>
            <li><span class="description">Nhập tỉ lệ thành công (%) và nhấn "Roll Dice" để nhận kết quả ngẫu nhiên (0-100).</span></li>
            <li><span class="description">Dice ≤ tỉ lệ: Success, Dice > tỉ lệ: Fail.</span></li>
        </ul>
    `;
    
    modal.style.display = "block";
}

// Đóng modal Help
function closeHelp() {
    const modal = document.getElementById('helpModal');
    modal.style.display = "none";
}

// Hàm khởi tạo tất cả các event listener
function initializeEventListeners() {
    const calculateButton = document.querySelector('button[onclick="calculateDamage()"]');
    const rollDiceButton = document.querySelector('button[onclick="rollDice()"]');
    const helpButton = document.getElementById('helpButton');
    const closeButton = document.querySelector('.close');
    const weaponTypeSelect = document.getElementById('weaponType');
    const rangedWeaponTypeSelect = document.getElementById('rangedWeaponType');
    const defenderActionSelect = document.getElementById('defenderAction');
    const evasionInput = document.getElementById('evasion');

    if (calculateButton) {
        calculateButton.addEventListener('click', calculateDamage);
    }
    if (rollDiceButton) {
        rollDiceButton.addEventListener('click', rollDice);
    }
    if (helpButton) {
        helpButton.addEventListener('click', showHelp);
    }
    if (closeButton) {
        closeButton.addEventListener('click', closeHelp);
    }
    if (weaponTypeSelect) {
        weaponTypeSelect.addEventListener('change', function() {
            if (this.value === 'ranged') {
                rangedWeaponTypeSelect.style.display = 'block';
            } else {
                rangedWeaponTypeSelect.style.display = 'none';
            }
        });
    }
    if (defenderActionSelect) {
        defenderActionSelect.addEventListener('change', function() {
            if (this.value === 'evasion') {
                evasionInput.style.display = 'block';
            } else {
                evasionInput.style.display = 'none';
            }
        });
    }

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('helpModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);