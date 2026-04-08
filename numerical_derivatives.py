import numpy as np
import matplotlib
matplotlib.use('Agg')  # Використовувати non-interactive backend
import matplotlib.pyplot as plt
from tabulate import tabulate
import sys
import io

# Налаштування кодування для Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Функція маятника
def theta(t):
    """θ(t) = 2*cos(t)"""
    return 2 * np.cos(t)

# Аналітичні похідні
def theta_prime_exact(t):
    """θ'(t) = -2*sin(t)"""
    return -2 * np.sin(t)

def theta_double_prime_exact(t):
    """θ''(t) = -2*cos(t)"""
    return -2 * np.cos(t)

# Різницеві формули для першої похідної
def left_derivative(f, t, h):
    """Ліва різницева похідна"""
    return (f(t) - f(t - h)) / h

def right_derivative(f, t, h):
    """Права різницева похідна"""
    return (f(t + h) - f(t)) / h

def central_derivative(f, t, h):
    """Центральна різницева похідна"""
    return (f(t + h) - f(t - h)) / (2 * h)

# Симетрична різницева друга похідна
def symmetric_second_derivative(f, t, h):
    """Симетрична різницева друга похідна"""
    return (f(t - h) - 2 * f(t) + f(t + h)) / (h ** 2)

# Точки для аналізу
t_points = [0.5, 1.5]

# Кроки сітки
h_initial = 0.1
h_values = [h_initial * (0.5 ** i) for i in range(6)]  # h, h/2, h/4, h/8, h/16, h/32

print("=" * 100)
print("АНАЛІЗ РІЗНИЦЕВИХ ПОХІДНИХ ДЛЯ ФУНКЦІЇ θ(t) = 2*cos(t)")
print("=" * 100)

# Аналіз для кожної точки
for t in t_points:
    print(f"\n{'=' * 100}")
    print(f"ТОЧКА t = {t}")
    print(f"{'=' * 100}")

    # Точні значення
    exact_first = theta_prime_exact(t)
    exact_second = theta_double_prime_exact(t)

    print(f"\nТочні значення:")
    print(f"  θ'({t}) = {exact_first:.10f}")
    print(f"  θ''({t}) = {exact_second:.10f}")

    # Таблиці для зберігання результатів
    results_first = []
    results_second = []

    # Обчислення для різних кроків
    for h in h_values:
        # Перша похідна
        left = left_derivative(theta, t, h)
        right = right_derivative(theta, t, h)
        central = central_derivative(theta, t, h)

        # Похибки першої похідної
        error_left = abs(left - exact_first)
        error_right = abs(right - exact_first)
        error_central = abs(central - exact_first)

        results_first.append([
            f"{h:.6f}",
            f"{left:.10f}",
            f"{error_left:.2e}",
            f"{right:.10f}",
            f"{error_right:.2e}",
            f"{central:.10f}",
            f"{error_central:.2e}"
        ])

        # Друга похідна
        second = symmetric_second_derivative(theta, t, h)
        error_second = abs(second - exact_second)

        results_second.append([
            f"{h:.6f}",
            f"{second:.10f}",
            f"{error_second:.2e}"
        ])

    # Виведення таблиць для першої похідної
    print(f"\n{'─' * 100}")
    print("ПЕРША ПОХІДНА")
    print(f"{'─' * 100}")

    headers_first = ["Крок h", "Ліва", "Похибка", "Права", "Похибка", "Центральна", "Похибка"]
    print(tabulate(results_first, headers=headers_first, tablefmt="grid"))

    # Виведення таблиці для другої похідної
    print(f"\n{'─' * 100}")
    print("ДРУГА ПОХІДНА (симетрична різницева)")
    print(f"{'─' * 100}")

    headers_second = ["Крок h", "Значення", "Похибка"]
    print(tabulate(results_second, headers=headers_second, tablefmt="grid"))

# Побудова графіків
print(f"\n{'=' * 100}")
print("ПОБУДОВА ГРАФІКІВ ЗАЛЕЖНОСТІ ПОХИБКИ ВІД КРОКУ СІТКИ")
print(f"{'=' * 100}\n")

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Залежність похибки різницевих похідних від кроку сітки', fontsize=14, fontweight='bold')

for idx, t in enumerate(t_points):
    # Обчислення похибок
    errors_left = []
    errors_right = []
    errors_central = []
    errors_second = []

    exact_first = theta_prime_exact(t)
    exact_second = theta_double_prime_exact(t)

    for h in h_values:
        errors_left.append(abs(left_derivative(theta, t, h) - exact_first))
        errors_right.append(abs(right_derivative(theta, t, h) - exact_first))
        errors_central.append(abs(central_derivative(theta, t, h) - exact_first))
        errors_second.append(abs(symmetric_second_derivative(theta, t, h) - exact_second))

    # Графік для першої похідної
    ax1 = axes[idx, 0]
    ax1.loglog(h_values, errors_left, 'o-', label='Ліва', linewidth=2, markersize=6)
    ax1.loglog(h_values, errors_right, 's-', label='Права', linewidth=2, markersize=6)
    ax1.loglog(h_values, errors_central, '^-', label='Центральна', linewidth=2, markersize=6)
    ax1.set_xlabel('Крок сітки h', fontsize=10)
    ax1.set_ylabel('Абсолютна похибка', fontsize=10)
    ax1.set_title(f'Перша похідна (t = {t})', fontsize=11, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend()

    # Графік для другої похідної
    ax2 = axes[idx, 1]
    ax2.loglog(h_values, errors_second, 'd-', color='red', label='Симетрична', linewidth=2, markersize=6)
    ax2.set_xlabel('Крок сітки h', fontsize=10)
    ax2.set_ylabel('Абсолютна похибка', fontsize=10)
    ax2.set_title(f'Друга похідна (t = {t})', fontsize=11, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    ax2.legend()

plt.tight_layout()
plt.savefig('derivatives_error_analysis.png', dpi=300, bbox_inches='tight')
print("Графіки збережено у файл: derivatives_error_analysis.png")
plt.close()

# Додатковий аналіз порядку точності
print(f"\n{'=' * 100}")
print("АНАЛІЗ ПОРЯДКУ ТОЧНОСТІ МЕТОДІВ")
print(f"{'=' * 100}\n")

for idx, t in enumerate(t_points):
    print(f"\nТочка t = {t}:")
    print("─" * 50)

    exact_first = theta_prime_exact(t)
    exact_second = theta_double_prime_exact(t)

    # Обчислення порядку точності (за двома послідовними кроками)
    print("\nПорядок точності (log₂(error₁/error₂)):")

    for i in range(len(h_values) - 1):
        h1, h2 = h_values[i], h_values[i + 1]

        # Для лівої похідної
        e1_left = abs(left_derivative(theta, t, h1) - exact_first)
        e2_left = abs(left_derivative(theta, t, h2) - exact_first)
        order_left = np.log2(e1_left / e2_left) if e2_left > 0 else 0

        # Для правої похідної
        e1_right = abs(right_derivative(theta, t, h1) - exact_first)
        e2_right = abs(right_derivative(theta, t, h2) - exact_first)
        order_right = np.log2(e1_right / e2_right) if e2_right > 0 else 0

        # Для центральної похідної
        e1_central = abs(central_derivative(theta, t, h1) - exact_first)
        e2_central = abs(central_derivative(theta, t, h2) - exact_first)
        order_central = np.log2(e1_central / e2_central) if e2_central > 0 else 0

        # Для другої похідної
        e1_second = abs(symmetric_second_derivative(theta, t, h1) - exact_second)
        e2_second = abs(symmetric_second_derivative(theta, t, h2) - exact_second)
        order_second = np.log2(e1_second / e2_second) if e2_second > 0 else 0

        print(f"  h: {h1:.6f} → {h2:.6f}")
        print(f"    Ліва: {order_left:.2f}, Права: {order_right:.2f}, "
              f"Центральна: {order_central:.2f}, Друга похідна: {order_second:.2f}")

print(f"\n{'=' * 100}")
print("ВИСНОВКИ:")
print(f"{'=' * 100}")
print("""
1. Ліва та права похідні мають перший порядок точності O(h)
   - Похибка зменшується приблизно вдвічі при зменшенні кроку вдвічі

2. Центральна похідна має другий порядок точності O(h²)
   - Похибка зменшується приблизно вчетверо при зменшенні кроку вдвічі
   - Значно точніша за ліву та праву похідні

3. Симетрична різницева друга похідна має другий порядок точності O(h²)
   - Похибка також зменшується приблизно вчетверо при зменшенні кроку вдвічі

4. При дуже малих кроках можуть виникати ефекти машинної похибки округлення
""")
