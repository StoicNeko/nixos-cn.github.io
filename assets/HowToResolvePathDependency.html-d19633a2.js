import{_ as r}from"./plugin-vue_export-helper-c27b6911.js";import{r as i,o as a,c as s,a as e,b as o,d,e as c}from"./app-7ec27fd9.js";const l={},p=c('<h1 id="如何解决路径依赖" tabindex="-1"><a class="header-anchor" href="#如何解决路径依赖" aria-hidden="true">#</a> 如何解决路径依赖</h1><h2 id="一切皆是文件" tabindex="-1"><a class="header-anchor" href="#一切皆是文件" aria-hidden="true">#</a> 一切皆是文件</h2><p>Linux 沿用了 Unix 的“一切皆是文件”理念。所有的输入/输出设备，包括硬盘、终端、打印机等，都被抽象为文件。</p><p>而虚拟文件系统（VFS）是这种理念的一个重要实现。VFS 提供了一个抽象层，使得用户可以使用统一的接口来访问各种不同类型的文件系统。在 Linux 中，VFS 不仅用于访问真实的文件系统（如 ext4、btrfs 等），还可以用于访问各种虚拟文件系统（procfs、sysfs 等）。</p><p>当你想操作它们的时候，只需要使用统一的文件操作 API（如 open、read、write 等）。这种设计简约且易用，广受赞誉。</p><h2 id="一种文件组织规范" tabindex="-1"><a class="header-anchor" href="#一种文件组织规范" aria-hidden="true">#</a> 一种文件组织规范</h2><p>我们在上面提到了 Linux 将一切抽象成文件，但是又如何组织这些文件呢？于是有了 FHS（Filesystem Hierarchy Standard）来指导统一的文件组织方式。</p><ul><li><code>/bin</code> 基本用户指令，无需特殊权限</li><li><code>/boot</code> 引导文件</li><li><code>/dev</code> 设备文件</li><li><code>/etc</code> 系统配置</li><li><code>/home</code> 用户家目录</li><li><code>/lib</code> 基本共享库与内核模块</li><li><code>/media</code> 可移动媒体的挂载点</li><li><code>/mnt</code> 临时文件系统挂载点</li><li><code>/opt</code> 拓展或业务软件</li><li><code>/run</code> 运行时变量数据</li><li><code>/root</code> 超级用户的家目录</li><li><code>/sbin</code> 系统库</li><li><code>/srv</code> 为系统服务准备的数据</li><li><code>/tmp</code> 临时文件</li></ul>',8),h={class:"hint-container tip"},_=e("p",{class:"hint-container-title"},"FHS",-1),u={href:"https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch03.html",target:"_blank",rel:"noopener noreferrer"},x=c('<p>FHS 规范了一种单根树形的文件组织方式，让不同发行版之间的程序移植变得可行，应用程序总是能找到它们期望的库文件或可执行程序。</p><p>不知道你还记得吗？在上一节我们提到过 Nix 会将包文件释放在一个不重复的哈希路径里，而不是诸如 <code>/usr/bin</code> 之类的路径，这是妥妥的放弃了 FHS 了，它该如何保证那些有<mark>路径依赖</mark>的软件顺利运行呢？</p><div class="hint-container note"><p class="hint-container-title">路径依赖</p><p>“路径依赖”是指应用程序在运行时需要访问的文件或目录的具体位置。例如，一个应用可能需要访问 <code>/usr/lib</code> 目录下的某个库文件，或者需要读取 <code>/etc</code> 目录下的配置文件。这些路径通常在应用的源代码中被硬编码，因此应用对它们有所依赖。</p></div><h2 id="兼容办法" tabindex="-1"><a class="header-anchor" href="#兼容办法" aria-hidden="true">#</a> 兼容办法</h2><p>NixOS 会通过以下方式确保有路径依赖的软件正常运行：</p><ul><li><p><strong>包装脚本（Wrapper Script）</strong>：NixOS 会为一些应用生成包装脚本。在执行它们的时候，包装脚本会很自然的将环境变量（比如 <code>LD_LIBRARY_PATH</code>）传递进去（新进程会继承其父进程的环境），它们就能在被安排好的环境变量里找到自己的依赖库。</p><div class="hint-container tip"><p class="hint-container-title">常见环境变量</p><p><code>PATH</code> 用于补充可执行程序的路径，让你在任何地方都能直接输入它们的名字以调用它们。</p><p><code>LIBRARY_PATH</code> 用于在编译链接阶段查找动态链接库（*.so）和静态链接库（*.a）。这个环境变量只在编译链接阶段起作用，对运行时的库搜索路径有影响的是下一个环境变量。</p><p><code>LD_LIBRARY_PATH</code> 用于指定动态链接器（ld）查找可执行文件运行时所依赖的动态链接库（*.so）的路径。即用于在程序运行期间查找动态链接库时，指定除标准路径 <code>/usr/lib</code> 之外的路径。</p></div></li><li><p><strong>构建过程中的路径替换</strong>：Nix 能接触到构建软件这一环节，自然可以对硬编码的路径进行替换。</p></li><li><p><strong>符号链接</strong>：NixOS 会将常见的目录或文件链接到存储在 <code>/nix/store</code> 中的相应文件。因为根目录下面的组织几乎全是链接在实现，所以根目录下面文件的组织对 NixOS 来说并不是太重要。</p></li></ul><h2 id="可切换的系统状态" tabindex="-1"><a class="header-anchor" href="#可切换的系统状态" aria-hidden="true">#</a> 可切换的系统状态</h2><p>在 NixOS 中还有一个代（generation）的概念，我们将不同的配置文件生成的系统状态称之为代，这些代实际上是链接不同的构建结果构成的。我们在上面就已经说过根目录的组织对 NixOS 不是非常重要，因为每次生成代（系统状态）就会新建一个根，链接不同的构建结果，也就是说，这个根是可以随时由 NixOS 根据配置重建的。</p>',8),m=e("p",null,"在生成代以后，NixOS 会添加新的引导条目，指向不同代的根目录，这样就能引导不同的系统状态。当然也能使用命令行工具实时切换这些状态。",-1);function S(f,N){const t=i("ExternalLinkIcon"),n=i("Mermaid");return a(),s("div",null,[p,e("div",h,[_,e("p",null,[o("我只罗列个大概，你可以前往"),e("a",u,[o("这个网站"),d(t)]),o("了解更多有关信息。")])]),x,d(n,{id:"mermaid-149",code:"eJxLL0osyFAIceFSAALH6OdT5j/rmKBgEKugq2un4Br9tKdVwTEWq6QbWNIJu6Q7WNIZIukEkzTCohNdEq9OD7CkC0TSGSZpiMVYdEkUr6BLwo0FAJHsXdA="}),m])}const L=r(l,[["render",S],["__file","HowToResolvePathDependency.html.vue"]]);export{L as default};
