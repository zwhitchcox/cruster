#pragma once

#include "App.xaml.g.h"

namespace winrt::app::implementation
{
    struct App : AppT<App>
    {
        App() noexcept;
    };
} // namespace winrt::app::implementation


