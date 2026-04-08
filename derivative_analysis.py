import numpy as np
import matplotlib.pyplot as plt

# Задана функція theta(t) = a*cos(omega*t + b)
a = 2
omega = 1
b = 0

def theta(t):
    """Функція theta(t) = 2*cos(t)"""
    return a * np.cos(omega * t + b)

def theta_prime_exact(t):
    """Точна перша похідна: theta'(t) = -2*sin(t)"""
    return -a * omega * np.sin(omega * t + b)

def theta_double_prime_exact(t):
    """Точна друга похідна: theta''(t) = -2*cos(t)"""
    return -a * omega**2 * np.cos(omega * t + b)

# Різницеві похідні
def left_derivative(f, t, h):
    """Ліва різницева похідна"""
    return (f(t) - f(t - h)) / h

def right_derivative(f, t, h):
    """Права різницева похідна"""
    return (f(t + h) - f(t)) / h

def central_derivative(f, t, h):
    """Центральна різницева похідна"""
    return (f(t + h) - f(t - h)) / (2 * h)

def second_derivative_symmetric(f, t, h):
    """Симетрична різницева друга похідна"""
    return (f(t - h) - 2 * f(t) + f(t + h)) / h**2

# Точки для аналізу
t1 = 1.0
t2 = 2.0

# Початковий крок і його зменшення
h_start = 0.1
steps = [h_start / (2**i) for i in range(6)]  # h, h/2, h/4, h/8, h/16, h/32

print("=" * 100)
print("ANALIZ POKHYBOK RIZNYTSEВYKH POKHIDNYKH")
print(f"Funktsiya: theta(t) = {a}*cos({omega}*t + {b}) = 2*cos(t)")
print("=" * 100)

for t_point in [t1, t2]:
    print(f"\n{'='*100}")
    print(f"TOCHKA t = {t_point}")
    print(f"{'='*100}")

    # Tochni znachennya pokhidnykh
    exact_first = theta_prime_exact(t_point)
    exact_second = theta_double_prime_exact(t_point)

    print(f"\nTochne znachennya pershoi pokhidnoi:  theta'({t_point}) = {exact_first:.10f}")
    print(f"Tochne znachennya druhoi pokhidnoi:  theta''({t_point}) = {exact_second:.10f}")

    # Tablitsya dlya pershoi pokhidnoi
    print(f"\n{'-'*100}")
    print("PERSHA POKHIDNA")
    print(f"{'-'*100}")
    print(f"{'Krok h':<15} {'Liva':<20} {'Pokhybka':<15} {'Prava':<20} {'Pokhybka':<15} {'Tsentralna':<20} {'Pokhybka':<15}")
    print(f"{'-'*100}")

    errors_left = []
    errors_right = []
    errors_central = []

    for h in steps:
        left = left_derivative(theta, t_point, h)
        right = right_derivative(theta, t_point, h)
        central = central_derivative(theta, t_point, h)

        err_left = abs(left - exact_first)
        err_right = abs(right - exact_first)
        err_central = abs(central - exact_first)

        errors_left.append(err_left)
        errors_right.append(err_right)
        errors_central.append(err_central)

        print(f"{h:<15.6e} {left:<20.10f} {err_left:<15.6e} {right:<20.10f} {err_right:<15.6e} {central:<20.10f} {err_central:<15.6e}")

    # Tablitsya dlya druhoi pokhidnoi
    print(f"\n{'-'*100}")
    print("DRUHA POKHIDNA (symetrychna riznitseva)")
    print(f"{'-'*100}")
    print(f"{'Krok h':<15} {'Znachennya':<20} {'Pokhybka':<15}")
    print(f"{'-'*100}")

    errors_second = []

    for h in steps:
        second = second_derivative_symmetric(theta, t_point, h)
        err_second = abs(second - exact_second)
        errors_second.append(err_second)

        print(f"{h:<15.6e} {second:<20.10f} {err_second:<15.6e}")

    # Grafiky pokhybok
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Grafik dlya pershoi pokhidnoi
    ax1.loglog(steps, errors_left, 'o-', label='Liva', linewidth=2, markersize=8)
    ax1.loglog(steps, errors_right, 's-', label='Prava', linewidth=2, markersize=8)
    ax1.loglog(steps, errors_central, '^-', label='Tsentralna', linewidth=2, markersize=8)
    ax1.set_xlabel('Krok h', fontsize=12)
    ax1.set_ylabel('Absolyutna pokhybka', fontsize=12)
    ax1.set_title(f'Pokhybka pershoi pokhidnoi v tochtsi t = {t_point}', fontsize=14)
    ax1.grid(True, which="both", ls="-", alpha=0.3)
    ax1.legend(fontsize=11)

    # Grafik dlya druhoi pokhidnoi
    ax2.loglog(steps, errors_second, 'd-', label='Symetrychna druha', linewidth=2, markersize=8, color='red')
    ax2.set_xlabel('Krok h', fontsize=12)
    ax2.set_ylabel('Absolyutna pokhybka', fontsize=12)
    ax2.set_title(f'Pokhybka druhoi pokhidnoi v tochtsi t = {t_point}', fontsize=14)
    ax2.grid(True, which="both", ls="-", alpha=0.3)
    ax2.legend(fontsize=11)

    plt.tight_layout()
    plt.savefig(f'error_analysis_t_{t_point}.png', dpi=150)
    print(f"\nGrafik zberezhen: error_analysis_t_{t_point}.png")

print(f"\n{'='*100}")
print("ANALIZ ZAVERSHEN")
print(f"{'='*100}")
