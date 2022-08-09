# Puzzle 可视化搭建

## Documentation

- KM: https://km.mihoyo.com/articleBase/649/67587

## Sites

- Development: `https://*.mihoyo.com:8080`
  - iHost、SwitchHosts 映射 `127.0.0.1` 到 `*.mihoyo.com` 主域
  - https、8080 端口访问
- Test: http://devop.mihoyo.com/static/puzzle-admin/index.html
- Production: https://op.mihoyo.com/static/puzzle-admin/index.html

# mr devlop 冲突解决办法：

1. 本地 checkout 到 develop，merge 新分支到 dev，然后解决冲突直接推送 dev
   或者 2. checkout 到 develop 然后新开个分支， 然后把那个合过去，然后再把这个新开的分支提 mr 合到 develop
