---
layout: post
title: MATLAB使用中的一些命令、技巧
description: MATLAB矩阵运算的一些函数
category: blog
---

在使用MATLAB的过程中，遇到了一些问题，记录如下。

##矩阵重复行（unique、setdiff）
在学习过程中遇到这样的问题：矩阵A是一个两列多行的矩阵，其中有许多重复的行，需要去除冗余。
如果用循环的方法

- 设置空矩阵B，遍历A中每行，没有在B中出现行就放在B中；

代码如下：

     for i=1:length(p_x(:));
         if i==1
             count_i = count_i+1;
             p_xy=d_redu_p_xy(i,:);
         else
             if max(sum(repmat(d_redu_p_xy(i,:),size(p_xy,1),1)==p_xy,2))~=2
                count_i = count_i+1
                p_xy=[p_xy;d_redu_p_xy(i,:)];
             end
         end;
     end
这样做很慢，完全丧失了MATLAB的优势，而下面使用`unique`函数，则是瞬间的事：

     p_xy = unique(d_redu_p_xy,'rows');
后来，又需要在没有冗余的A矩阵上增加包含A中所有行的矩阵B，从集合意义上就是求B-A，可以用`unique`实现如下：

     p_xy_co = [p_xy;p_xy_10];
     [b,m,n]=unique(p_xy_co,'rows');
     mm = sort(m);
     index_new_area = mm(1:length(m)-length(p_xy_10(:,1)));
     p_xy_new = p_xy(index_new_area,:);
或者直接使用`setdiff`函数：
     p_xy_new = setdiff(p_xy, p_xy_10, 'rows');
##平面像素点幅度计算
一般方法，对`xcut×ycut`的像素平面，在MATLAB中直接用两个循环循环每点。而使用矩阵的运算就会省下很多的时间：
